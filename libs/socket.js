module.exports = function(io){
  io.sockets.on('connection', function(client){
    //client.emit('hello', {title: 'Bem vindo', msg: 'You has been conected! '});


    /*client.on('temp', function(data) {
      client.emit('update', {msg: 'Teste'});
    });*/



  });
}
