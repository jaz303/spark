global.lib = function(lib) { return require('./lib/' + lib); };

var hk              = require('hudkit'),
    fs              = require('fs'),
    path            = require('path'),
    userhome        = require('userhome');

var FileDialogs     = lib('file_dialogs'),
    ProjectState    = lib('project_state')

var rootPane        = null,
    dialogs         = null,
    state           = null;

var actNew, actOpen, actSave, actSaveAs, actReset;

process.on('uncaughtException', function(err) {
    console.error("!!! UNHANDLED EXCEPTION !!!");
    console.error(err);
});

function setWorkingDir(dir) {
    dialogs.setWorkingDir(dir);
}

function activeProjectChanged() {
    var pp = state.getProjectPath();
    setWorkingDir(pp === null ? userhome() : path.dirname(pp));
}

exports.init = function(window, document) {

    global.window = window;
    global.document = document;

    rootPane = hk.init();
    dialogs = new FileDialogs(document);
    state = new ProjectState(rootPane);

    setupActions();
    setupMenus();

    state.onActiveProjectChanged.connect(activeProjectChanged);
    state.onError.connect(function(err) {
        if (err instanceof Error) {
            console.error(err);
        }
        window.alert(err.message || err);
    });

    var App = window.require('nw.gui').App;

    var argv = App.argv;
    if (argv.length) {
        state.openProject(argv[0]);
    } else {
        state.newProject('sketch');
    }

    App.on('open', function(path) {
        state.openProject(path);
    });

    dialogs.onOpen.connect(function(path) {
        state.openProject(path);
    });

    dialogs.onSaveAs.connect(function(path) {
        if (!path.match(/\.\w+$/)) {
            path += '.spark';
        }
        state.saveProjectAs(path);
    });

}

function setupActions() {

    actNew = hk.action(function() {
        state.newProject('sketch');
    }, {title: 'New'});

    actOpen = hk.action(function() {
        dialogs.showOpen();
    }, {title: 'Open...'});

    actSave = hk.action(function() {
        if (state.isPersisted()) {
            state.saveProject();
        } else {
            dialogs.showSaveAs();
        }
    }, {title: 'Save'});

    actSaveAs = hk.action(function() {
        dialogs.showSaveAs();
    }, {title: 'Save As...'});

    actReset = hk.action(function() {
        var project = state.getProject();
        if (project) project.reset();
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
