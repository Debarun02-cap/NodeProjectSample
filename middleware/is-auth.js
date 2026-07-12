module.exports = (requiredRole) => {
  return (req, res, next) => {
    let userId, userRole;

    // Check authorization header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (authHeader) {
      try {
        // Try parsing as JSON if the frontend sends a JSON string
        const parsed = JSON.parse(authHeader);
        userId = parsed.id || parsed.userId;
        userRole = parsed.role || parsed.userRole;
      } catch (err) {
        // Fallback: assume format "Bearer id:role" or "id role"
        const token = authHeader.replace('Bearer ', '').trim();
        const parts = token.split(/[: ]/);
        userId = parts[0];
        if (parts.length > 1) {
          userRole = parts[1];
        }
      }
    } else if (req.session && req.session.user) {
      // Fallback to session data if header is not present
      userId = req.session.user.id;
      userRole = req.session.user.role;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated. Authorization header missing or invalid." });
    }

    if (requiredRole) {
      if (userRole !== requiredRole && !(requiredRole === 'admin' && userRole === 'superadmin')) {
        return res.status(403).json({ success: false, message: "Forbidden. You do not have the required role to access this resource." });
      }
    }

    // Attach to request for downstream usage
    req.user = {
      id: userId,
      role: userRole
    };
    
    next();
  };
};
