const express = require('express');
const router = express.Router();

const mapCRUD = require('./mapCRUD.js');
const ganerateMap = require('./maps.js');

router.use(mapCRUD);
router.use(ganerateMap);

module.exports = router;
