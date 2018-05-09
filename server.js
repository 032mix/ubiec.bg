require('./Player.js');

let express = require('express');
let app = express();
let serv = require('http').Server(app);
let io = require('socket.io')(serv, {});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/', express.static(__dirname + '/client'));

serv.listen(2000);
console.log('Server started.');

let SOCKET_LIST = {};

io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    console.log('A player with ID ' + socket.id + ' connected.');

    socket.on('newPlayer', function (username) {
        Player.onConnect(socket, username);
    });

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
});
