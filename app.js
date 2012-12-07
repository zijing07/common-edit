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
    var doc_data = "Click here to start editting";
    return doc_data;
}

function getUserNameFromDB(user_id) {
    // TODO: mongo db logic
    var user_name = 'test_name';
    return user_name;
}

function saveDocData(data) {
    // TODO: mongo db logic
}

app.get('/doc/:doc_id', function(req, res) {
    // TODO: Get user id from session
    req.session.user_id = 1;
    new_doc_socket(req.params.doc_id);

    var doc_id = req.params.doc_id;
    var user_id = req.session.user_id;
    var doc_data = getDocDataFromDB(doc_id);
    var user_name = getUserNameFromDB(user_id);
    res.render('doc.ejs', {
	locals: {
	    title : 'Common Edit',
	    doc_data : doc_data,
	    user_id : user_id,
	    doc_id : doc_id,
	    user_name : user_name
	}
    });
});

function addOnlineUser(users, client, user_name) {
    var user = [client.addresss, client.port, user_name];
    users.push(user);
    
    return users;
}

function removeOnlineUser(users, client, user_name) {
    var user = [client.address, client.port, user_name];
    var index = users.indexOf(user);
    users.splice(index,1);

    return users;
}

function new_doc_socket(doc_id) {
    var doc_url = '/doc/' + doc_id;
    var doc_socket = io.of(doc_url);
    users = [];
    var user_name = '';
    
    doc_socket.on('connection', function(socket) {

	socket.on("message", function(msg) {
	    console.log("Message received on chat: " + msg);
	    socket.broadcast.send(msg);
	});

	socket.on('user_id', function(data) {
	    user_name = getUserNameFromDB(data.user_id);
	    users = addOnlineUser(users, socket.handshake.address, user_name);

	    socket.emit('new_user', { users: users });
	    socket.broadcast.emit('new_user', { users: users });
	    
	});

	socket.on('save_doc_data', function (data) {
	    saveDocData(data.doc_data);
	}

	socket.on('disconnect', function() {
	    removeOnlineUser(users, socket.handshake.address, user_name);
	    socket.emit('offline_user', {users: users});
	    socket.broadcast.emit('offline_user', {users: users});
	});
    });
}

