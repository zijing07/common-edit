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

io.sockets.on('connection', function (socket) {
    socket.on('broadcast', function(data) {
	console.log('broadcast message: ' + data.msg);
	socket.broadcast.emit('coming');
	socket.broadcast.json.send({data: data.msg});
    });

    socket.on("message", function(msg) {
	console.log("Message received: " + msg);
	socket.broadcast.send(msg);
    });
});
