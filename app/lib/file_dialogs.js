var signal = require('signalkit');

function FileDialogs(doc) {

    var inputOpen = document.createElement('input');
    inputOpen.setAttribute('type', 'file');
    //inputOpen.setAttribute('nwdirectory', );
    inputOpen.style.display = 'none';
    doc.body.appendChild(inputOpen);

    var inputSaveAs = document.createElement('input');
    inputSaveAs.setAttribute('type', 'file');
    inputSaveAs.setAttribute('nwsaveas', true);
    inputSaveAs.style.display = 'none';
    doc.body.appendChild(inputSaveAs);

    this._muted = false;
    this._open = inputOpen;
    this._saveAs = inputSaveAs;

    this.onOpen = signal('onOpen');
    this.onSaveAs = signal('onSaveAs');

    this._open.addEventListener('change', function() {
        if (this._muted) return;
        this.onOpen.emit(this._open.value);
    }.bind(this));

    this._saveAs.addEventListener('change', function() {
        if (this._muted) return;
        this.onSaveAs.emit(this._saveAs.value);
    }.bind(this));

}

FileDialogs.prototype.showOpen = function() {
    this.clear();
    this._open.click();
}

FileDialogs.prototype.showSaveAs = function() {
    this._saveAs.click();
}

FileDialogs.prototype.setWorkingDir = function(dir) {
    this._open.setAttribute('nwworkingdir', dir);
    this._saveAs.setAttribute('nwworkingdir', dir);
}

FileDialogs.prototype.clear = function() {
    this._muted = true;
    this._open.value = '';
    this._saveAs.value = '';
    this._muted = false;
}

module.exports = FileDialogs;