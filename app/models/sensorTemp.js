/**
* Arquivo: sensorTemp.js
* Descrição: Arquivo onde trataremos o modelo da classe 'SensorTemp'
* Author: Mauricio Reis
* Data de Criação: 31/05/2018
*
*/


var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
* SensorTemp:
*
* -> Id: int
* -> Ambiente: String
* -> Temperatura: String
* -> Umidade: String
* -> Data: Date
*
*/

var SensorTempSchema = new Schema({
  ambiente: String,
  temperatura: String,
  umidade: String,
  data: Date
});

module.exports = mongoose.model('SensorTemp', SensorTempSchema);
