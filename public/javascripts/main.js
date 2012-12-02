var DEBUG = true;

var socket = io.connect("/");
if (DEBUG) {
    console.log("We have connected");
}

var dmp = new diff_match_patch();
var origin_data = '';

socket.on('connect', function() {
    socket.on('message', function(diff) {
	if (DEBUG) {
	    console.log("Message received: " + diff);
	}
	var msg = CKEDITOR.instances.doc.getData();
	var patches = dmp.patch_make(msg, diff);
	var text = dmp.patch_apply(patches, msg);
	if (DEBUG) {
	    console.log("Apply changes from " + msg + " to " + text[0]);
	}
	CKEDITOR.instances.doc.setData(text[0]);
	origin_data = text[0];
    });
});

function send(text) {
    if (DEBUG) {
	console.log("Sending: " + text);
    }
    socket.send(text);
}

function handle_text() {
    var text = CKEDITOR.instances.doc.getData();
    var diff = dmp.diff_main(origin_data, text);
    if (DEBUG) {
	console.log(diff);
    }

    origin_data = text;
    send(diff);
}

window.onload = function() {
//    CKEDITOR.disableAutoInline = true;
//    CKEDITOR.inline(document.getElementById('doc'));
    console.log("Set origin data when first load.");
    origin_data = CKEDITOR.instances.doc.getData();
};
