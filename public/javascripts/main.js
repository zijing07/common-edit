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
	var final_text = text[0].replace(/(<p>)?([,-]*[01],*)+(<\/p>)?\s*/g, "");
	if (DEBUG) {
	    console.log("Apply changes from " + msg + " to " + final_text);
	}
	CKEDITOR.instances.doc.setData(final_text);
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
