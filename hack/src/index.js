var mode = require('../../mode.js');

window.onload = function() {
    var cm = mode.CodeMirror.fromTextArea(document.getElementById("editor"), {
        mode: 'rego',
        lineNumbers: true
    });
    cm.setSize('100%', '100%');
}
