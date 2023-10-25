const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create an instance of Express
const app = express();

// Middleware to log request headers
app.use((req, res, next) => {
  console.log("In comes a " + req.method + " to " + req.url);  
  console.log('Request Headers:', req.headers);
  next();
});
// Define createOrUpdateUser route
app.post('/createOrUpdateUser', (req, res) => {
  // Access Firestore using the admin.firestore() method
  //const db = admin.firestore();
  // Perform create or update user operation
  // ...
  res.send('User created or updated!');
});

// Define Firebase Cloud Function
const api = functions.https.onRequest(app);

// Export the API
module.exports = { api };