//Core Module
const path=require('path')

// Load environment variables from .env before anything else
require('dotenv').config();

//External Module
const express=require('express');
const session=require('express-session');

//Local Module 
const {ur, registeredComplaints}=require('./routes/user');
const ar=require('./routes/admin');
const ir=require('./routes/auth');
const imageRoutes=require('./routes/images');
const {dbConnect}=require('./utils/databaseUtil');

const app=express();

// ---------------------------------------------------------------------------
// CORS – allow requests from the React dev server (and any localhost origin)
// ---------------------------------------------------------------------------
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  // Allow any localhost origin (e.g. http://localhost:5173, http://localhost:3001)
  if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight (OPTIONS) requests immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.set('view engine','ejs')

// Static files (css/images) served from /public
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
// Session middleware for login state
app.use(session({
  secret: process.env.SESSION_SECRET || 'fixmycity-secret',
  resave:false,
  saveUninitialized:false
}));

// Make login info available to all views
app.use((req,res,next)=>{
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.userRole = req.session.user ? req.session.user.role : null;
  res.locals.currentUserId = req.session.user ? req.session.user.id : null;
  next();
});
const superadminRoutes = require('./routes/superadmin');
app.use(ir);
app.use('/admin',ar);
app.use('/user',ur);
app.use('/superadmin', superadminRoutes);
app.use(imageRoutes);

const port=3000;
dbConnect(()=>{
  app.listen(port,()=>{  
    console.log("MongoDB connection successful");
    console.log(`Server is running on http://localhost:${port}`);
  });
});
