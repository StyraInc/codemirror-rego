const CodeMirror = require('codemirror')

const commands = CodeMirror.commands
const keyMap = CodeMirror.keyMap.styra = {fallthrough: 'default'}
const mac = CodeMirror.keyMap.default === CodeMirror.keyMap.macDefault
const Pos = CodeMirror.Pos

// `singleSelection` is mapped by default to Escape and -- when there are
// multiple selections active -- deselects all but the primary selection.
// We preserve this behavior except when there is only a single selection,
// then we deselect it as well.
const singleSelection = commands.singleSelection
commands.singleSelection = function (cm) {
  var selections = cm.getSelections()
  if (selections.length > 1) {
    singleSelection(cm)
  } else {
    cm.setCursor(cm.getCursor('head'))
  }
}

keyMap[(mac ? 'Cmd-' : 'Ctrl-') + '/'] = function (cm) {
  cm.toggleComment({commentBlankLines: true})
}

const mirror = '(){}[]'
function selectBetweenBrackets(cm) {
  var pos = cm.getCursor(), opening = cm.scanForBracket(pos, -1)
  if (!opening) {
    return
  }
  for (;;) {
    var closing = cm.scanForBracket(pos, 1)
    if (!closing) {
      return
    }
    if (closing.ch == mirror.charAt(mirror.indexOf(opening.ch) + 1)) {
      var openingOffset = Pos(opening.pos.line, opening.pos.ch + 1)
      cm.setSelection(openingOffset, closing.pos, false)
      return true
    }
    pos = Pos(closing.pos.line, closing.pos.ch + 1)
  }
}

commands[keyMap['Shift-Ctrl-Space'] = 'selectScope'] = function (cm) {
  selectBetweenBrackets(cm) || cm.execCommand('selectAll')
}

commands[keyMap['Shift-Ctrl-M'] = 'selectBetweenBrackets'] = function (cm) {
  if (!selectBetweenBrackets(cm)) {
    return CodeMirror.Pass
  }
}

commands[keyMap['Ctrl-M'] = 'goToBracket'] = function (cm) {
  cm.extendSelectionsBy((range) => {
    var next = cm.scanForBracket(range.head, 1)
    if (next && CodeMirror.cmpPos(next.pos, range.head) != 0) {
      return next.pos
    }
    var prev = cm.scanForBracket(range.head, -1)
    return prev && Pos(prev.pos.line, prev.pos.ch + 1) || range.head
  })
}

CodeMirror.normalizeKeyMap(keyMap)