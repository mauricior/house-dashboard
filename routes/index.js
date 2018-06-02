var express = require('express');
var router = express.Router();
var Sensor = require('../app/models/sensorTemp');

/* GET home page. */
router.get('/', function(req, res, next) {
  var lastTemp = '';
  var lastUmid = '';
  getLastValues(function(data) {
    lastTemp = data[0];
    lastUmid = data[1];
  res.render('index', { title: 'Home Dashboard', temperatura: lastTemp, umidade: lastUmid});
  });
});


function getLastValues(callback) {
  Sensor.findOne({}, {}, { sort: { field: 'asc', _id: -1} }, function(err, post) {
    var temp;
    var umid;
    if(err)
      console.log(err);

    temp = post.temperatura;
    umid = post.umidade;
    var teste = [temp , umid];
    callback(teste);
  });
}




module.exports = router;
