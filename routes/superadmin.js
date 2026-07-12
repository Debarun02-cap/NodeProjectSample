const express = require('express');
const User = require('../models/user');
const Complaint = require('../models/complaint');
const Status = require('../models/status');
const { getDb } = require('../utils/databaseUtil');
// Updated: activity and users endpoints now use consistent _id-based user identification
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.use(isAuth('superadmin'));

// GET /superadmin/usage - stats & bar chart counts
router.get('/usage', (req, res) => {
  Complaint.fetchAll((complaints) => {
    const ids = complaints.map(c => c.id);
    Status.getLatestForIds(ids, (statusMap) => {
      let pending = 0;
      let progress = 0;
      let completed = 0;
      
      complaints.forEach(complaint => {
        const latest = statusMap && statusMap[complaint.id || complaint._id];
        const rawStatus = (latest ? latest.workstatus : (complaint.status || 'pending')).toLowerCase();
        
        if (rawStatus.includes('progress') || rawStatus.includes('work-on-progress')) {
          progress++;
        } else if (rawStatus.includes('complete') || rawStatus.includes('resolve')) {
          completed++;
        } else {
          pending++;
        }
      });

      // Location with maximum complaints
      const locationCounts = {};
      complaints.forEach(c => {
        let loc = c.locationUrl || c.locationurl || '';
        if (loc.includes('?q=')) {
          try {
            const q = new URL(loc).searchParams.get('q');
            if (q) loc = q.split(',')[0].trim();
          } catch (e) {}
        }
        if (loc) {
          locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        }
      });
      let maxLocation = 'N/A';
      let maxCount = 0;
      Object.keys(locationCounts).forEach(loc => {
        if (locationCounts[loc] > maxCount) {
          maxCount = locationCounts[loc];
          maxLocation = loc;
        }
      });

      // Complaint with longest pending time
      let longestPendingComplaint = null;
      let maxPendingMs = 0;
      complaints.forEach(c => {
        const latest = statusMap && statusMap[c.id || c._id];
        const rawStatus = (latest ? latest.workstatus : (c.status || 'pending')).toLowerCase();
        const isPending = !rawStatus.includes('progress') && !rawStatus.includes('work-on-progress') && !rawStatus.includes('complete') && !rawStatus.includes('resolve');
        if (isPending) {
          const { ObjectId } = require('mongodb');
          let cDate = c.createdAt;
          if (!cDate && c._id) {
            try {
              cDate = new ObjectId(c._id).getTimestamp();
            } catch (err) {}
          }
          if (!cDate) cDate = new Date();
          const pendingMs = new Date() - new Date(cDate);
          if (pendingMs > maxPendingMs) {
            maxPendingMs = pendingMs;
            longestPendingComplaint = c;
          }
        }
      });
      let longestPendingInfo = 'N/A';
      if (longestPendingComplaint) {
        const days = Math.floor(maxPendingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((maxPendingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        longestPendingInfo = `"${longestPendingComplaint.title}" (${days}d ${hours}h)`;
      }

      // Categories of problem that is maximum reported
      const categoryCounts = {};
      complaints.forEach(c => {
        const cat = c.issuetype || 'General';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      let maxCategory = 'N/A';
      let maxCatCount = 0;
      Object.keys(categoryCounts).forEach(cat => {
        if (categoryCounts[cat] > maxCatCount) {
          maxCatCount = categoryCounts[cat];
          maxCategory = cat;
        }
      });

      res.json({
        success: true,
        stats: {
          registered: complaints.length,
          pending,
          progress,
          completed,
          maxLocation,
          longestPending: longestPendingInfo,
          maxCategory
        }
      });
    });
  });
});

// GET /superadmin/users - list admins and citizens
router.get('/users', (req, res) => {
  User.fetchAll((users) => {
    const admins = [];
    const citizens = [];

    users.forEach(u => {
      const uInfo = {
        id: u._id ? u._id.toString() : (u.id || ''),
        name: `${u.firstname} ${u.lastname}`,
        email: u.email || '',
        mobile: u.mobile || '',
        location: `${u.city || ''}, ${u.state || ''}`.replace(/^,\s*|,\s*$/, '').trim() || 'N/A'
      };

      if (u.role === 'admin') {
        admins.push(uInfo);
      } else if (u.role === 'citizen') {
        citizens.push(uInfo);
      }
    });

    res.json({
      success: true,
      admins,
      citizens
    });
  });
});

// GET /superadmin/activity/:role/:userId - list activities
router.get('/activity/:role/:userId', (req, res) => {
  const { role, userId } = req.params;
  const db = getDb();

  if (role === 'citizen') {
    // Look up user to get both id formats (random id and _id)
    db.collection('users')
      .findOne({ $or: [{ _id: (() => { try { const { ObjectId } = require('mongodb'); return new ObjectId(userId); } catch(e) { return null; } })() }, { id: userId }] })
      .then(user => {
        // Build list of possible userId values to match complaints
        const possibleIds = [userId];
        if (user) {
          if (user.id && !possibleIds.includes(user.id)) possibleIds.push(user.id);
          if (user._id && !possibleIds.includes(user._id.toString())) possibleIds.push(user._id.toString());
        }
        return db.collection('complaints')
          .find({ userId: { $in: possibleIds } })
          .toArray();
      })
      .then(complaints => {
        const activities = complaints.map(c => ({
          title: `Registered complaint: "${c.title}"`,
          description: c.description || 'No description provided.',
          dateTime: c.createdAt || 'N/A'
        }));
        res.json({ success: true, activities });
      })
      .catch(err => {
        console.error('Error fetching citizen activities:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch citizen activities.' });
      });
  } else if (role === 'admin') {
    db.collection('statuses')
      .find({ userId: userId })
      .toArray()
      .then(async statusUpdates => {
        const activities = [];
        for (const st of statusUpdates) {
          const comp = await db.collection('complaints').findOne({ id: st.complaintId });
          activities.push({
            title: `Updated complaint: "${comp ? comp.title : st.complaintId}"`,
            description: `${st.workstatus.toUpperCase()}: ${st.title} - ${st.description}`,
            dateTime: st.dateTime || 'N/A'
          });
        }
        res.json({ success: true, activities });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: 'Failed to fetch admin activities.' });
      });
  } else {
    res.status(400).json({ success: false, message: 'Invalid role' });
  }
});

// DELETE /superadmin/admin/:userId - delete admin profile
router.delete('/admin/:userId', (req, res) => {
  const { userId } = req.params;
  User.deleteById(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete admin profile.' });
    }
    res.json({ success: true, message: 'Admin profile deleted successfully.' });
  });
});

// POST /superadmin/block/:userId - block and delete citizen
router.post('/block/:userId', (req, res) => {
  const { userId } = req.params;
  User.findById(userId, (user) => {
    if (!user) {
      return res.status(404).json({ success: false, message: 'Citizen profile not found.' });
    }
    const db = getDb();
    db.collection('blacklist')
      .insertOne({
        email: user.email,
        mobile: user.mobile,
        blockedAt: new Date()
      })
      .then(() => {
        User.deleteById(userId, (err, result) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete citizen account after blacklisting.' });
          }
          res.json({ success: true, message: 'Citizen has been successfully blocked and credentials blacklisted.' });
        });
      })
      .catch(err => {
        console.error('Blacklist insertion failed:', err);
        res.status(500).json({ success: false, message: 'Failed to blacklist citizen credentials.' });
      });
  });
});

module.exports = router;
