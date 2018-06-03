/**
* Arquivo: server.js
* Descrição: Arquivo que cria os dois servidores necessários para a aplicação,
* um é o servidor TCP/IP que recebe os dados do sensor via wifi por meio do
* ESP8266, e o outro servidor é o responsável por criar as páginas web do nosso
* dashboard.
* Author: Mauricio Reis
* Data de Criação: 31/05/2018
*
*/


// SERVIDOR RESPONSAVEL POR CRIAR AS PÁGINAS DO DASHBOARD
//=============================================================================

// load the Node.js TCP library
const net = require('net');
var SensorTemp = require('./app/models/sensorTemp');
var mongoose = require('mongoose');
var moment = require('moment-timezone');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var io = require('socket.io')();
var socket = require('./libs/socket')(io);

var indexRouter = require('./routes/index');

var app = express();

app.io = io;



var temp = 0;
var umid = 0;
var lastTemp = 0;
var lastUmid = 0;

// configura a view
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// reconhece 404 e manda gera o erro
app.use(function(req, res, next) {
  next(createError(404));
});

// gerenciador de erros
app.use(function(err, req, res, next) {
  //erro para o desenvolvedor
  //res.locals.message = err.message;
  //res.local.error = req.app.get('env') === 'development' ? err : {};

  // criar a pagina de erro
  res.status(err.status || 500);
  //res.sender('error');
});


//=============================================================================




// SERVIDOR RESPONSAVEL POR CRIAR O TCP/IP QUE RECEBE OS DADOS DO SENSOR VIA WIFI



//==============================================================================
//Servidor do socketio
// Não sei o que eu fiz, mais deixei o servidor GLOBAL
// Dessa forma eu consigo acessar o client.emit dentro da minha
// função que recebe valores do ESP8266 via WIFI
// by the way, it works!
var client = io.sockets.on('connection', function(client) {
  client.emit('hello', {msg: 'OI, EU MANDO TEMP!'});

  //Quando um novo cliente se conecta, o socket client emite, um PUTA array com todas as
  //informações presentes no db para popular o gráfico na inicialização
  getAllValuesSensor(function( data) {
    //*Prestar atenção: eu nomiei os valores como 'data', na hora de ler no
    //servidor será algo parecido com: msg.data[0].temperatura **
    client.emit('allValues', {data})

  });
});



//Banco LocalHost
//Se não for criado antes, ele será criado automaticamente
mongoose.connect('mongodb://localhost/home-dashboard')

//CONFIGURA A PORTA E O IP DO SERVIDOR TCP/IP
const PORT = 5000;
const ADDRESS = '192.168.0.19';



//Cria o servidor e passa um evento como parametro para toda vez que um cliente
// se conectar
let server = net.createServer(onClientConnected);
server.listen(PORT, ADDRESS);

//Evento que é acionado toda vez que um cliente novo se conecta
function onClientConnected(socket) {
  var clientName = `${socket.remoteAddress}:${socket.remotePort}`;

  console.log(`${clientName} connected.`);
  console.log("Awaiting for data...");


  socket.on('data', (data) => {

    //Pega os dados enviados pelo cliente
    //Transforma em nova linha os caracteres [\r or \n]
    var m = data.toString().replace(/[\n\r]*$/, '');
    var aux = m.split(" ");
    //Pega a temperatura da string recebida pelo cliente
    lastTemp = temp;
    temp = aux[1];
    //Pega a umidade da string recebida pelo cliente
    lastUmid = umid;
    umid = aux[3];
    //Pega a data do local
    var date = moment().format('DD/MM/YYYY HH:mm:ss');
    //var dataTimezoneBrasil = data.tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');

    //Manda mensagem para o front via socket io
    client.emit('valores', {title: 'Atualiza Valores', temperatura: temp, umidade: umid, data: date});
    //client.emit('umid', {title: 'Atualiza Umid', msg: umid, data: date});

    console.log(`${clientName} data received: ${m}`);

    // Crio meu sensor de temperatura
    var sensorTemp = new SensorTemp();

    //Vamos carregar os campos com os valores capturados
    sensorTemp.ambiente = "Quarto";
    sensorTemp.temperatura = temp;
    sensorTemp.umidade = umid;
    sensorTemp.data = date;

    //salva no banco de dados
    sensorTemp.save(function(err) {
      if(err)
        console.log("Erro ao salvar as informações no banco.");

      console.log("Informações salvas...");
    });


  });



  //Acionado quando o client se desconecta
  socket.on('end', () => {
    //Exibe a mensagem no console do servidor
    console.log(`${clientName} disconnected.`);
  });
}


//Função que retorna todos os valores salvos do Sensor de temperatura
//Salvos no banco
function getAllValuesSensor(callback){
  SensorTemp.find(function(err, result) {
    if(err)
    console.log(err);


   callback(result);
  });
}




console.log(`Server started at: ${ADDRESS}:${PORT}`);

//==============================================================================


module.exports = app;
