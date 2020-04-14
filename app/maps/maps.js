import { get_map } from './generate_map';
import { if_else_path_condition_commands_with_loop } from './decisionMakingCommands';
import { arrToObject, objectToArr } from '../utils/utils';

const express = require('express');
const router = express.Router();
const db = require('../db');

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

router.post('/get-map', async (req, res) => {
  console.log(req.body.level);
  const documentRef = await db.collection('maps').doc(req.body.level.toString()).get();
  const data = documentRef.data();

  console.log(data);

  if (data.is_done) {
    data.tiles.platform = objectToArr(data.tiles.platform);
    data.tiles.wall = objectToArr(data.tiles.wall);
    data.tiles.enemies = objectToArr(data.tiles.enemies);
    data.tiles.tileoverlay = objectToArr(data.tiles.tileoverlay);
    data.tiles.floatingobj = objectToArr(data.tiles.floatingobj);
    data.tiles.walloverlay = objectToArr(data.tiles.walloverlay);
    data.tiles.tiles = objectToArr(data.tiles.tiles);
    return res.status(200).json({ ...data });
  }

  const maps = get_map(data);

  const { player, blocks, ...tiles } = maps;

  return res.status(200).json({ tiles, player, blocks });
});

router.post('/testtest', async (req, res) => {
  const data = {
    commandLength: 0,
    commandLengthInCondition: 5,
    numIteration: 8,
    numTurnInLoop: 0,
    numberOfDistractions: 0,
    condition_type: 'if',
    condition_cate: 'tile',
    is_reversed: false,
    probs_of_actions: [0.4, 0.2, 0.2, 0, 0.2],
    type_of_actions: 5,
    is_done: false,
  };

  const maps = get_map(data);

  const { player, blocks, ...tiles } = maps;

  tiles.platform = arrToObject(tiles.platform);
  tiles.wall = arrToObject(tiles.wall);
  tiles.enemies = arrToObject(tiles.enemies);
  tiles.tileoverlay = arrToObject(tiles.tileoverlay);
  tiles.floatingobj = arrToObject(tiles.floatingobj);
  tiles.walloverlay = arrToObject(tiles.walloverlay);
  tiles.tiles = arrToObject(tiles.tiles);
  // return res.status(200).json(commands);
  return res.status(200).json({ tiles, player, blocks });
});

router.get('/catagory', async (req, res) => {
  console.log('123');
  return res.send('LOLLL');
});

module.exports = router;
