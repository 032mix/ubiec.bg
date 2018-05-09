let width = window.innerWidth;
let height = window.innerHeight;

let config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game;
let username;

function startGame() {
    username = $('#username').val();

    if (username.length < 3) {
        $('#error').html('Username must be at least 3 characters long.');
        return;
    }
    $('.login').hide();
    $('.chat').show();
    game = new Phaser.Game(config);
}

function preload() {
    this.load.image('player', 'img/sprite.png');
}

let allPlayers = {};

function create() {
    let self = this;

    socket.emit('newPlayer', username);

    socket.on('allPlayers', function (playersList) {
        for (let i = 0; i < playersList.length; i++) {
            addPlayer(self, playersList[i].x, playersList[i].y, playersList[i].id, playersList[i].username);
        }
    });

    socket.on('newPlayerJoined', function (newPlayer) {
        addPlayer(self, newPlayer.x, newPlayer.y, newPlayer.id, newPlayer.username);
        addChatMsg('Player ' + newPlayer.username + ' connected.');
    });

    socket.on('playerLeft', function (player) {
        removePlayer(self, player.id);
        addChatMsg('Player ' + player.username + ' disconnected.');
    });

    socket.on('getNewChatMsg', function (data) {
        addChatMsg(data);
    })
}

function update() {

}

let addPlayer = function (self, x, y, id, username) {
    allPlayers[id] = {
        player: self.add.sprite(x, y, 'player').setInteractive(),
        username: self.add.text(x - 20, y - 40, username)
    };

    allPlayers[id].player.on('pointerup', function (pointer) {
        for (let i = 0; i < allPlayers.length; i++) {
            allPlayers[id].player.clearTint();
        }

        console.log(id);
        console.log(socket.id);
        this.setTint(0xff0000);
    });
};

let removePlayer = function (self, id) {
    allPlayers[id].player.destroy();
    allPlayers[id].username.destroy();
    delete allPlayers[id];
};

let addChatMsg = function (msg) {
    let box = $('#chat-text');
    box.append('<div>' + msg + '</div>');
    box.stop().animate({scrollTop: box[0].scrollHeight}, 1000);
};

$("#chat-input").on('keyup', function (e) {
    let input = $('#chat-input');
    if (e.keyCode == 13) {
        socket.emit('sendNewChatMsg', input.val());
        input.val('');
    }
});