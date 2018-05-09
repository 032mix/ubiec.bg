let playersTotal = 0;

Player = function (id, username) {
    let self = {
        id: id,
        x: 250 + (100 * ++playersTotal),
        y: 250,
        username: username
    };

    Player.list[id] = self;
    return self;
};
Player.list = {};

Player.onConnect = function (socket, username) {
    let player = Player(socket.id, username);

    socket.emit('allPlayers', Player.getPlayers());
    socket.broadcast.emit('newPlayerJoined', player);

    socket.on('sendNewChatMsg', function (msg) {
        socket.broadcast.emit('getNewChatMsg', username + ': ' + msg);
    });
};

Player.onDisconnect = function (socket) {
    socket.broadcast.emit('playerLeft', Player.list[socket.id]);
    delete Player.list[socket.id];
};

Player.getPlayers = function () {
    let pack = [];
    for (let i in Player.list) {
        let player = Player.list[i];
        pack.push({
            x: player.x,
            y: player.y,
            id: player.id,
            username: player.username
        })
    }

    return pack;
};