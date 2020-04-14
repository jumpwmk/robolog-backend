const express = require('express');
const router = express.Router();

const saveLog = require('./save-log');
const updateUser = require('./update-user');

router.use(saveLog);
router.use(updateUser);

module.exports = router;
