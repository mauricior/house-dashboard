(function() {
  var socket = io('http://localhost:3000');
  socket.on('hello', function(msg){
    console.log(msg);

  });

var temp = 0;
var dataTemp = 0;
var umid = 0;
var dataUmid = 0;

var historianTemp = []
var historianUmid = []
var historianDates = []

var myChart = '';

//Aguardo o servidor do back-end me mandar a 'tag' com todos os valores salvos
//No banco de dados para popular nosso gráfico assim que o user entrar
socket.on('allValues', function(msg) {

//Carrego as variaveis locais com os dados provenientes do banco
  for (var i = 0; i < msg.data.length; i++) {
    historianTemp.push(msg.data[i].temperatura);
    historianUmid.push(msg.data[i].umidade);
    historianDates.push(msg.data[i].data);
  }


  //Carrego o gráfico com os dados armazenados no banco assim que o usuário conectar
  myChart.setOption({
    xAxis: {
        type: 'category',
        splitLine: {
          show: false
        },
        data: historianDates
    },
      series: [{
          // find series by name
          name: 'Temperatura (Celsius)',
          data: historianTemp
        },
        {
            // find series by name
            name: 'Umidade (%)',
            data: historianUmid
        }]
  });


});

//Aguardo o servidor do back-end me mandar a 'tag' de temperatura e a mensagem com o valor
//lido pelo sensor e a data
  socket.on('temp', function(msg) {
    console.log(msg);

    //Atualizo o html com o valor lido em tempo real
    //Separo as variaveis de temperatura e data
    document.getElementById('temp').innerHTML = msg.msg + "°C";
    temp = msg.msg;
    dataTemp = msg.data;

    //Salvo leitura a leitura a data em um array para posteriormente atualizar nosso gráfico
    historianDates.push(dataTemp);
    //console.log("Historico Datas: " + historianTempDates);

    //Salvo leitura a leitura o valor lido em um array para posteriormente atualizar nosso gráfico
    historianTemp.push(temp);
    //console.log("Historico Temp: " + historianTemp)


    //A cada leitura realizada pelo sensor atualizo o gráfico com os dados atuais
    myChart.setOption({
      xAxis: {
          type: 'category',
          splitLine: {
            show: false
          },
          data: historianDates
      },
        series: [{
            // find series by name
            name: 'Temperatura (Celsius)',
            data: historianTemp
          }]
    });


});


//Aguardo o servidor do back-end me mandar a 'tag' de umidade e a mensagem com o valor
//lido pelo sensor e a data
  socket.on('umid', function(msg) {
    console.log(msg);

    //Atualizo o html com o valor lido em tempo real
    //Separo as variaveis de umidade e data
    document.getElementById('umid').innerHTML = msg.msg + "%";
    umid = msg.msg;
    dataUmid = msg.data;

    //Salvo leitura a leitura a data em um array para posteriormente atualizar nosso gráfico
    historianDates.push(dataUmid);

    //Salvo leitura a leitura o valor lido em um array para posteriormente atualizar nosso gráfico
    historianUmid.push(umid);


    //A cada leitura realizada pelo sensor atualizo o gráfico com os dados atuais
    myChart.setOption({
      xAxis: {
          type: 'category',
          splitLine: {
            show: false
          },
          data: historianDates
      },
        series: [{
            // find series by name
            name: 'Umidade (%)',
            data: historianUmid
        }]
    });

});




//Cria o gráfico de temperatura e umidade assim que o front é carregado
  window.onload = function () {
// Atualiza nosso front com o gráfico
myChart = echarts.init(document.getElementById('main'));
// Desenha o gráfico
myChart.setOption({
  title: {
        text: ''
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['Temperatura (Celsius)', 'Umidade (%)'],
        position: 'bottom'
    },
    dataZoom: [
       {
           show: false,
           realtime: true,
           start: 30,
           end: 70,
           xAxisIndex: [0]
       },
       {
           type: 'inside',
           realtime: true,
           start: 30,
           end: 70,
           xAxisIndex: [0]
       }
   ],
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data:''
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name:'Temperatura (Celsius)',
            type:'line',
            data:''
        },
        {
            name:'Umidade (%)',
            type:'line',
            data:''
        }
    ]
  });
}




})()
