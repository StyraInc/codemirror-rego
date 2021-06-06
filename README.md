# Rego Codemirror Addons

Rego mode and minimal key map for CodeMirror that we use at Styra.

## Usage

Simply import either the mode, key map, or both after importing CodeMirror. The key map also requires some additional addons to be imported first:

```javascript
import CodeMirror from 'codemirror'

// Other CodeMirror addons...

import 'codemirror-rego/mode' // You can now use mode: 'rego'
// and/or
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror-rego/key-map' // You can now use keyMap: 'styra'
```
