const net = require('net');
const http = require('http');
const express = require('express');
const videohubServer = require('./nodeModules/videohubServer.js').videohubServer;
var bodyParser = require("body-parser");
var app = express();
var mainPort = 80;

console.log(videohubServer);
videohubServer.start();

app.get('/videohub/api', (req, res) => {
    res.send(videohubServer.videohubs);
})

app.get('/videohub/route', (req, res) => {
    console.log("route");
    videohubServer.route({input: req.query.input, output: req.query.output, videohub: req.query.videohub})
    res.sendStatus(200)
})

function httpRequest(host, port, path){
    return new Promise(function(resolve, reject) {
        var options = {
            host: host,
            path: path,
            port: port,
        };
        callback = function(response) {
            var str = ''
            response.on('data', function (chunk) {
                str += chunk;
            });
            response.on('end', function () {
                resolve({str});
            });
        }
        var req = http.request(options, callback);
        req.end();
    })
}

app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));

app.post('/setCameras', function (req, res) {
    console.log(req.originalUrl);
    console.log(req.body);
    cameras = req.body;
    res.sendStatus(200);
});

app.get('/getCameras', function (req, res) {
    console.log(req.originalUrl);
    res.send(cameras);
});

app.listen(mainPort, () => {
    console.log(`Example app listening at http://localhost:${mainPort}`);
})

var cameraStartPort = 1010

var ATEMInputs = [
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23
]

var testInput = [
    33
]

var cameras = [
    {
        "IP": "10.100.6.230",
        "model": "HE130",
        "TCPAPI": null,
        "videohubInput": 4
    },
    {
        "IP": "10.100.6.225",
        "model": "HE130",
        "TCPAPI": null,
        "videohubInput": 6
    },
    {
        "IP": "10.100.6.222",
        "model": "HE130",
        "TCPAPI": null,
        "videohubInput": 13
    }
]

var expressAPIs = []

cameras.forEach((camera, i) => {
    expressAPIs[i] = express();
    expressAPIs[i].get('/*', function (req, res) {
        //console.log(req.originalUrl);
        httpRequest(cameras[i].IP, 80, req.originalUrl).then(response =>{
            //console.log(80, response.str)
            res.send(response.str)
        });
    });
    expressAPIs[i].listen(cameraStartPort + i, () => {
        console.log(`Camera ${i} MITM at http://localhost:${cameraStartPort + i}`)
    })
});
/* 
var client;
client = new net.Socket();

client.connect({port: 35200, host: "10.100.3.51"});

client.on('connect', () => {
  console.log('connected to server!');
});

client.on('data', function(data){
  console.log(data)
});

client.on('end', () => {
  console.log('disconnected from server');
});

var server = net.createServer(function(socket) {
    try {
        socket.on('data', function(data) {
            console.log("TCP: ",data.toString())
        });
        
    } catch (error) {
        console.log(error);
    }
}).listen(35200);

*/