global.lib = function(lib) { return require('./lib/' + lib); };

var hk      = require('hudkit'),
    fs      = require('fs'),
    path    = require('path');

var rootPane    = null,
    openFile    = null,
    activeMode  = null;

var inputOpen, inputSaveAs, inputMute = false;

var actNew, actOpen, actSave, actSaveAs;
var actReset;

process.on('uncaughtException', function(err) {
    console.error("!!! UNHANDLED EXCEPTION !!!");
    console.error(err);
});

exports.init = function(window, document) {

    global.window = window;
    global.document = document;

    rootPane = hk.init();
    
    setupFileInputs();
    setWorkingDir(getUserHome());
    setupActions();
    setupMenus();

    var App = window.require('nw.gui').App;
    
    var argv = App.argv;
    if (argv.length) {
        openProject(argv[0]);
    } else {
        newProject('sketch');    
    }

    App.on('open', function(cmd) {
        openProject(cmd);
    });
    
}

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function setWorkingDir() {
    if (openFile) {
        var dir = path.dirname(openFile);
        inputOpen.setAttribute('nwworkingdir', dir);
        inputSaveAs.setAttribute('nwworkingdir', dir);
    }
}

function updateOpenFile(file) {
    openFile = file;
}

function clearFileInputs() {
    inputMute = true;
    inputOpen.value = '';
    inputSaveAs.value = '';
    inputMute = false;
}

function setupFileInputs() {

    inputOpen = document.createElement('input');
    inputOpen.setAttribute('type', 'file');
    inputOpen.style.display = 'none';
    document.body.appendChild(inputOpen);

    inputSaveAs = document.createElement('input');
    inputSaveAs.setAttribute('type', 'file');
    inputSaveAs.setAttribute('nwsaveas', true);
    inputSaveAs.style.display = 'none';
    document.body.appendChild(inputSaveAs);

    inputOpen.addEventListener('change', function() {
        if (inputMute) return;
        var path = inputOpen.value;
        process.nextTick(function() {
            openProject(path);    
        });
    });

    inputSaveAs.addEventListener('change', function() {
        if (inputMute) return;
        var path = inputSaveAs.value;
        if (!path.match(/\.\w+$/)) {
            path += '.spark';
        }
        process.nextTick(function() {
            saveProjectAs(path);    
        });
    });

}

function setupActions() {

    actNew = hk.action(function() {
        newProject('sketch');
    }, {title: 'New'});

    actOpen = hk.action(function() {
        clearFileInputs();
        inputOpen.click();
    }, {title: 'Open...'});

    actSave = hk.action(function() {
        if (openFile) {
            saveProject();    
        } else {
            clearFileInputs();
            setWorkingDir();
            inputSaveAs.click();
        }
    }, {title: 'Save'});

    actSaveAs = hk.action(function() {
        clearFileInputs();
        setWorkingDir();
        inputSaveAs.click();
    }, {title: 'Save As...'});

    actReset = hk.action(function() {
        if (activeMode) {
            activeMode.reset();
        }
    }, {title: 'Reset'});

}

function setupMenus() {

    var gui = window.require('nw.gui');
    
    function addMenuAction(menu, action) {

        var item = new gui.MenuItem({
            label: action.getTitle(),
            click: action
        });

        function sync() {
            item.label = action.getTitle();
            item.enabled = action.isEnabled();
        }

        action.onchange.connect(sync);

        menu.append(item);

    }

    var fileMenu = new gui.Menu();
    addMenuAction(fileMenu, actNew);
    addMenuAction(fileMenu, actOpen);
    addMenuAction(fileMenu, actSave);
    addMenuAction(fileMenu, actSaveAs);

    var fileMenuItem = new gui.MenuItem({label: 'File'});
    fileMenuItem.submenu = fileMenu;

    var envMenu = new gui.Menu();
    addMenuAction(envMenu, actReset);

    var envMenuItem = new gui.MenuItem({label: 'Environment'});
    envMenuItem.submenu = envMenu;

    var topMenu = new gui.Menu({type: 'menubar'});
    gui.Window.get().menu = topMenu;
    topMenu = gui.Window.get().menu;
    topMenu.insert(fileMenuItem, 1);
    topMenu.insert(envMenuItem, 2);

}

function serialize(s) {
    return JSON.stringify(s);
}

function deserialize(s) {
    return JSON.parse(s);
}

function teardownActiveProject() {

    if (!activeMode)
        return;

    activeMode.teardown();

    rootPane.setRootWidget(null);
    rootPane.setToolbar(null);
    rootPane.showToolbar();

}

function newProject(mode) {

    teardownActiveProject();

    updateOpenFile(null);

    var Mode = lib('modes/' + mode);
    activeMode = new Mode();
    activeMode.setup(rootPane);

}

function openProject(file) {
    fs.readFile(file, {encoding: 'utf8'}, function(err, json) {

        if (err) {
            return;
        }
        
        try {
            var data = deserialize(json);
        } catch (e) {
            return;
        }

        if (!('mode_id' in data)) {
            console.warn("invalid project file %s, no mode_id", file);
            return;
        }

        newProject(data.mode_id);

        activeMode.setState(data);
        updateOpenFile(file);
        
    });
}

function saveProject() {

    if (!activeMode || !openFile) {
        console.warn("save requested when no open project");
        return;
    }

    return saveProjectAs(openFile);

}

function saveProjectAs(file) {

    if (!activeMode) {
        console.warn("save as requested when no open project");
        return;
    }

    try {
        var state = activeMode.getState();
        state.mode_id = activeMode.id;
        var data = serialize(state);
    } catch (e) {
        return;
    }

    fs.writeFile(file, data, {encoding: 'utf8'}, function(err) {
        if (!err) {
            updateOpenFile(file);
        }
    });

}