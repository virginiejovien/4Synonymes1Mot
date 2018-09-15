// ***************************************************************************************************************   
//     MODULE LANCEMENT BASE DE DONNEES JEU                         
//**************************************************************************************************************** 

var urlDb = 'mongodb://localhost:27017';
var nameDb = 'jeu';
const MongoClient = require('mongodb').MongoClient;

exports.connectDB = function(req, res, next, cb) {
  if (this.mongoClient && this.mongoClient.isConnected()) {
    var instance = client.db(this.mongoClient);
    cb(instance);
  } else {
    MongoClient.connect(urlDb, function(err, client) {
      this.mongoClient = client;
      if (err) {
        res.status(503);
        next();
        return;
      }
      var instance = client.db(nameDb);
      cb(instance);
    });
  }
};