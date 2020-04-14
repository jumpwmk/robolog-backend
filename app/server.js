require('dotenv').config();

// Dependencies
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

const app = require('./app');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/robolog1412.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/robolog1412.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/robolog1412.com/chain.pem', 'utf8');

const credentials = {
   key: privateKey,
   cert: certificate,
   ca: ca,
 };

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

