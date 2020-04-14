var admin = require('firebase-admin');

var serviceAccount = require('../logicgame-9f4ca-firebase-adminsdk-80vw9-945285eefb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://logicgame-9f4ca.firebaseio.com'
});

var db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

module.exports = db;
