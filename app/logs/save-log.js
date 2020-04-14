const express = require('express');
const router = express.Router();
const db = require('../db');

import { arrToObject } from '../utils/utils';

// const ref = await db.collection('retailer').add(retailer)
//   console.log(ref.id)
//   const documentRef = db.collection('retailer').doc(ref.id)
//   const userRef = await db.collection('users').doc(uid).set({
//     username: retailer['username'],
//     ref: documentRef
//   })
// var addDoc = db
//     .collection('users')
//     .add({
//       name: 'Tokyo',
//       country: 'Japan'
//     })
//     .then(ref => {
//       console.log('Added document with ID: ', ref.id);
//     });

router.post('/save-log', async (req, res) => {
  // const ref = await db.collection('log')
  //   console.log(ref.id)
  //   const documentRef = db.collection('retailer').doc(ref.id)
  //   const userRef = await db.collection('users').doc(uid).set({
  //     username: retailer['username'],
  //     ref: documentRef
  //   })
  try {
    // console.log(req.body);
    let { maps, ...otherProps } = req.body;
    maps = arrToObject(maps);
    let addDoc = db
      .collection('log')
      .add({ maps, ...otherProps })
      .then(ref => {
        console.log('Added document with ID: ', ref.id);
      });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ res: 'failure' });
  }

  //   // console.log(JSON.stringify(tiles));
  return res.status(200).json({ res: 'success' });
});

module.exports = router;
