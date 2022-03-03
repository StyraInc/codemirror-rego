const CodeMirror = require('codemirror')

const {builtins} = require('./capabilities.json')

CodeMirror.defineMode('rego', (editorOptions, modeOptions) => {
  const BUILTIN_REFERENCES_RE = new RegExp('\\b(?:' + builtins.filter((c) => c.includes('.')).join('|') + ')\\b')
  const BUILTINS_RE = new RegExp('\\b(?:' + builtins.filter((c) => !c.includes('.')).join('|') + ')\\b')
  const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z_0-9]*/
  const KEYWORDS_RE = /\b(?:as|default|else|import|not|with|some|in|every)\b/
  const NUMBER_RE = /^-?(?:(?:(?:0(?!\d+)|[1-9][0-9]*)(?:\.[0-9]+)?)|(?:\.[0-9]+))(?:[eE][-+]?[0-9]+)?/
  const OPERATOR_RE = /^(?:&|;|\*|\+|-|\/|%|=|:=|==|!=|<|>|>=|<=|\|)/
  const SCALAR_RE = /\b(?:true|false|null)\b/

  const ast = modeOptions.ast
  const packagesByName = {}
  const rulesByName = {}

  if (ast) {
    packagesByName[ast.package.getName()] = true
    ast.imports.forEach((x) => (packagesByName[x.getName()] = true))
    ast.rules.forEach((x) => (rulesByName[x.getName()] = true))
  }

  function eatBuiltinReference(stream) {
    const match = stream.match(BUILTIN_REFERENCES_RE, false)
    if (match) {
      var n = match[0].lastIndexOf('.') + 1
      var i = 0

      stream.eatWhile(() => {
        return ++i < n
      })

      return match[0].split('.').pop()
    }
  }

  function eatPathIdentifier(stream) {
    const identifier = eatIdentifier(stream)

    if (stream.eat('.')) {
      return
    }

    return identifier
  }

  function eatIdentifier(stream) {
    var match = stream.match(IDENTIFIER_RE)
    if (match) {
      return match[0]
    }
  }

  function eatString(stream) {
    let escaped = false

    stream.eatWhile((c) => {
      if (escaped) {
        escaped = false
      } else {
        if (c === '"') {
          return false
        } else if (c === '\\') {
          escaped = true
        }
      }

      return true
    })

    stream.eat('"')
  }

  function inBacktickString(stream, state) {
    var next
    while (next = stream.next()) { // eslint-disable-line no-cond-assign
      if (next === '`') {
        state.tokenize = base
        break
      }
    }
    return 'string-2'
  }

  function base(stream, state) {
    if (stream.eatSpace()) {
      return
    } else if (state.builtin) {
      stream.match(state.builtin)
      state.builtin = ''
      return 'builtin'
    } else if (state.inPackage) {
      if (stream.match(/\bas\b/)) {
        return 'keyword'
      }
      const identifier = eatPathIdentifier(stream)
      if (identifier) {
        state.inPackage = false
        return 'variable-2'
      }
    } else if (state.inPath) {
      const identifier = eatPathIdentifier(stream)
      if (identifier) {
        state.inPath = false
      }
    } else if (stream.eat('"')) {
      eatString(stream, state)
      return 'string'
    } else if (stream.eat('`')) {
      return (state.tokenize = inBacktickString)(stream, state)
    } else if (stream.eat('#')) {
      stream.skipToEnd()
      return 'comment'
    } else if (stream.match(/\bpackage\b/) || stream.match(/\bimport\b/)) {
      state.inPackage = true
      return 'keyword'
    } else if (stream.match(KEYWORDS_RE)) {
      return 'keyword'
    } else if (stream.match(SCALAR_RE)) {
      return 'atom'
    } else if (stream.match(/\binput\b/)) {
      return 'variable-2'
    } else if (stream.match(NUMBER_RE)) {
      return 'number'
    } else if (stream.eat('.')) {
      state.inPath = true
    } else {
      const builtin = eatBuiltinReference(stream)
      if (builtin) {
        state.builtin = builtin
      } else {
        const identifier = eatIdentifier(stream)
        if (identifier) {
          if (identifier === '_') {
            return 'operator'
          } else if ((BUILTINS_RE).test(identifier)) {
            return 'builtin'
          } else if (rulesByName[identifier]) {
            return 'def'
          } else if (packagesByName[identifier]) {
            return 'variable-2'
          }
          return 'variable'

        } else if (stream.match(OPERATOR_RE)) {
          return 'operator'
        }
      }

      stream.next()
    }

    if (stream.pos === stream.start) {
    // We weren’t able to tokenize anything and `stream` is in exactly the
    // same place as it was at the beginning of the `token()` call. One way
    // that this can happen is if the stream is syntactically invalid (e.g.,
    // `bar.[x]`). Whatever the cause, we need to skip past the problematic
    // character.
      stream.next()
    }
  }

  return {
    token: function (stream, state) {
      return state.tokenize(stream, state)
    },

    startState: function () {
      return {
        builtin: '',
        inPackage: false,
        inPath: false,
        tokenize: base
      }
    },

    lineComment: '#'
  }
})

CodeMirror.defineMIME('application/rego', 'rego')

module.exports = {
  CodeMirror
}
