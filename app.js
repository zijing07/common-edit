var express = require('express')
, app = express()
, routes = require('./routes')
, server = require('http').createServer(app)
, path = require('path')
, io = require('socket.io').listen(server);

server.listen(3000);

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});


app.get('/', routes.index);

var chat = io.of('/chat');
chat.on('connection', function(socket) {
    console.log("Connection to chat");

    socket.on("message", function(msg) {
	console.log("Message received on chat: " + msg);
	socket.broadcast.send('hi all chat mem');
    });
});

/*
io.sockets.on('connection', function (socket) {

    socket.on("message", function(msg) {
	console.log("Message received: " + msg);
	socket.broadcast.send(msg);
    });
});
*/
