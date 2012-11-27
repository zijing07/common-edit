

var socket = io.connect("/");
console.log("We have connected");


socket.on('connect', function() {
    socket.on('message', function(msg) {
	var elem = document.getElementById('doc');
	console.log("Message received: " + msg);
	elem.value = msg;
    });
});

function send() {
    var elem = document.getElementById('doc');
    console.log(elem.value);
    socket.send(elem.value);
}
