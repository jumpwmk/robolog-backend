const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/create', async (req, res) => {
  var addDoc = db
    .collection('wholesalers')
    .add({
      name: 'Tokyo',
      country: 'Japan'
    })
    .then(ref => {
      console.log('Added document with ID: ', ref.id);
    });
  return res.send();
});

router.post('/create-shop', async (req, res) => {
  var addDoc = db
    .collection('wholesalers')
    .add({
      name: 'Tokyo',
      country: 'Japan'
    })
    .then(ref => {
      console.log('Added document with ID: ', ref.id);
    });
  return res.send();
});
router.get('/get', async (req, res) => {
  return res.send('LOLLL');
});
router.post('/update', async (req, res) => {
  return res.send();
});
router.post('/delete', async (req, res) => {
  return res.send();
});

module.exports = router;
