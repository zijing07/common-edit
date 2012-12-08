var DEBUG = false;

var doc_url = '/doc/' + document.getElementById('doc_id').innerHTML;
var doc_socket = io.connect(doc_url);

var dmp = new diff_match_patch();
var origin_data = '';

var before_length = 10;
function get_before_text(text, offset) {
    // Get at most 10 characters before it
    // TODO: special cases handling :|

    var from = offset - before_length;
    if (from < 0) from = 0;

    return text.substring(from, offset);
}

function get_offset_position(org_text, new_text, offset) {
    if (offset == 0) {
	return 0;
    }
    var before_text = get_before_text(org_text, offset);
    var position = new_text.search(before_text);
    if (position == -1) position = 0;
    return position + before_text.length;
}

function set_editor_data(final_text) {
    var editor = CKEDITOR.instances.doc;
    var dom_elem = CKEDITOR.dom.element.get(document.getElementById('doc'));

    // Retrieve original cursor position
    var range = editor.getSelection().getRanges()[0];
    var origin_offset = range.startOffset;
    var origin_plain_text = dom_elem.getText();

    // Apply new text data
    editor.setData(final_text);
    var new_plain_text = dom_elem.getText();

    // New cursor position
    var offset = get_offset_position(origin_plain_text, new_plain_text, range.startOffset);
    if (DEBUG) {
	console.log('New offset position is: ' + new_plain_text[offset] + ' ' + offset);
    }

    editor = CKEDITOR.instances.doc;
    range = editor.getSelection().getRanges()[0];
    range.startOffset = offset;
    range.endOffset = offset;
    range.select();
}

var MENU_KEY_CODE = -7;
function handle_text(event) {
    var key_code = event.keyCode;
    if ((key_code >= 65 && key_code <= 90) ||
	(key_code >= 48 && key_code <= 57) ||
	(key_code >= 186 && key_code <= 192) ||
	(key_code >= 219 && key_code <= 222) ||
	key_code == 8 || key_code == 32 || key_code == MENU_KEY_CODE) {
	var text = CKEDITOR.instances.doc.getData();
	var diff = dmp.diff_main(origin_data, text);

	origin_data = text;
	doc_socket.send(text);
    }
}

function update_user_list(users) {
    if (DEBUG)
	console.log(users);
    var elem = document.getElementById('user_list');
    elem.innerHTML = '';
    for (var i=0; i<users.length; ++i) {
	elem.innerHTML += '<p>' + users[i][0] + ':' + users[i][1] + ':' + users[i][2] + '</p>';
    }
}

function save_doc() {
    if (DEBUG) {
	console.log('save doc data');
    }
    doc_socket.emit('save_doc_data', {doc_data: CKEDITOR.instances.doc.getData()});
}

/***********************************************
 * socket operations
 */
doc_socket.on('connect', function() {
    if (DEBUG) {
	console.log("Doc socket has connected!");
    }
    doc_socket.emit('user_id', { user_id: document.getElementById('user_id').innerHTML} );
});

doc_socket.on('new_user', function(data) {
    if (DEBUG) {
	console.log('new user is coming');
    }
    update_user_list(data.users);
});

doc_socket.on('offline_user', function(data) {
    if (DEBUG) {
	console.log('a user gets offline');
    }
    update_user_list(data.users);
});

doc_socket.on('message', function(diff) {
    var msg = CKEDITOR.instances.doc.getData();
    var patches = dmp.patch_make(msg, diff);
    var text = dmp.patch_apply(patches, msg);
    var final_text = text[0].replace(/(<p>)?([,-]*[01],*)+(<\/p>)?\s*/g, "");

    set_editor_data(final_text);
    origin_data = text[0];
});

window.onload = function() {
    editor = CKEDITOR.instances.doc;
    origin_data = editor.getData();

    // Editor menu operations
    editor.on('afterCommandExec', function(e) {
	handle_text(MENU_KEY_CODE);
    });
};
