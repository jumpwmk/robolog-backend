const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/update-user', async (req, res) => {
  try {
    let { user } = req.body;
    const uid = user.id;
    console.log('update user at ');
    console.log(uid);
    console.log(user);
    const userRef = await db
      .collection('users')
      .doc(uid)
      .set({ ...user });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ res: 'failure' });
  }

  //   // console.log(JSON.stringify(tiles));
  return res.status(200).json({ res: 'success' });
});

module.exports = router;
