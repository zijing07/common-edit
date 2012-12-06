var DEBUG = true;

var express = require('express')
, app = express()
, routes = require('./routes')
, server = require('http').createServer(app)
, path = require('path')
, io = require('socket.io').listen(server);

server.listen(3000);

var store = new express.session.MemoryStore;

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session({ secret:'secret', store:store }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

function getDocDataFromDB(doc_id) {
    // TODO: mongo db logic
    doc_data = "Click here to start editting";
    return doc_data;
}

app.get('/doc/:doc_id', function(req, res) {
    // TODO: Get user id from session
    req.session.user_id = 1;

    var doc_id = req.params.doc_id;
    var user_id = req.session.user_id;
    var doc_data = getDocDataFromDB(doc_id);
    res.render('doc.ejs', {
	locals: {
	    title : 'Common Edit',
	    doc_data : doc_data,
	    user_id : user_id
	}
    });
});

function addOnlineUser(users, client) {
    var user = [client.addresss, client.port];
    users.push(user);
    
    return users;
}

function removeOnlineUser(users, client) {
    var user = [client.address, client.port];
    var index = users.indexOf(user);
    users.splice(index,1);

    return users;
}

(function () {
    var doc_socket = io.of("/doc/123");
    users = [];
    
    doc_socket.on('connection', function(socket) {
	users = addOnlineUser(users, socket.handshake.address);

	if (DEBUG) {
	    console.log('Online users: ' + users);
	}

	socket.on("message", function(msg) {
	    console.log("Message received on chat: " + msg);
	    socket.broadcast.send(msg);
	});

	socket.on('disconnect', function() {
	    removeOnlineUser(users, socket.handshake.address);
	    if (DEBUG) {
		console.log('Online users: ' + users);
	    }
	});
    });
})()

/*
io.sockets.on('connection', function (socket) {

    socket.on("message", function(msg) {
	console.log("Message received: " + msg);
	socket.broadcast.send(msg);
    });
});
*/
