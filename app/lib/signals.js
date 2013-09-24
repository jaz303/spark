var s = require('signalkit');

function addSignal(name) {
    exports[name] = s(name);
}

addSignal('fileLoaded');
