var DEBUG = true;

var doc_socket = io.connect('/doc/123');

var dmp = new diff_match_patch();
var origin_data = '';

doc_socket.on('connect', function() {
    if (DEBUG) {
	console.log("Doc socket has connected!");
    }
});

doc_socket.on('message', function(diff) {
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


function send(text) {
    if (DEBUG) {
	console.log("Sending: " + text);
    }
    doc_socket.send(text);
}

function handle_text() {
    var text = CKEDITOR.instances.doc.getData();
    var diff = dmp.diff_main(origin_data, text);
    if (DEBUG) {
	console.log(diff);
    }

    /*
    var dom_elem = CKEDITOR.dom.element.get(document.getElementById('doc'));
    document.getElementById('plain_text').innerHTML = dom_elem.getText();
    */

    var editor = CKEDITOR.instances.doc;
    var s = editor.getSelection();
    var range = s.getRanges()[0]; // save selected range
    range.startOffset = 1;
    range.endOffset = 1;
    range.select();

    origin_data = text;
    send(diff);
}

window.onload = function() {
    origin_data = CKEDITOR.instances.doc.getData();
    console.log("Set origin data when first load: " + origin_data);
};
