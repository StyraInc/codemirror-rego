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

## Development

First run `npm install` in the project root directory to ensure all dependencies are fetched and the project is built.

Next, you may run `webpack` in the `hack` directory. This will build a version of the Node module adapted for web browsers
(found in the `hack/dist` directory). Once that is done, open the `hack/index.html` file in your browser of choice, and you
should see an instance of the CodeMirror editor, with syntax highlighting enabled for Rego.

## Community

For questions, discussions and announcements related to Styra products, services and open source projects, please join the Styra community on [Slack](https://join.slack.com/t/styracommunity/shared_invite/zt-1p81qz8g4-t2OLKbvw0J5ibdcNc62~6Q)!