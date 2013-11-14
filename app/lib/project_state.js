var signal  = require('signalkit');

var pio     = lib('project_io');

function ProjectState(rootPane) {
    this._root = rootPane;
    this._project = null;
    
    this.onActiveProjectChanged = signal('onActiveProjectChanged');
    this.onProjectSaved         = signal('onProjectSaved');
    this.onError                = signal('onError');
}

ProjectState.prototype.getProject = function() {
    return this._project;
}

ProjectState.prototype.getProjectPath = function() {
    return this._project ? this._project.getPath() : null;
}

ProjectState.prototype.newProject = function(mode) {

    var project = createNewProject(this, mode);
    project.new();
    setActiveProject(this, project);
    
    process.nextTick(function() {
        this.onActiveProjectChanged.emit();
    }.bind(this));

}

ProjectState.prototype.isPersisted = function() {
    return this._project ? this._project.isPersisted() : false;
}

ProjectState.prototype.openProject = function(path) {

    var self = this;

    pio.readProjectMode(path, function(err, mode) {
        
        if (err) {
            self.onError.emit(err);
            return;
        }

        try {
            var project = createNewProject(self, mode);    
        } catch (e) {
            self.onError.emit("Invalid mode: " + mode);
            return;
        }

        project.open(path, function(err) {

            if (err) {
                self.onError.emit(err);
                return;
            }

            setActiveProject(self, project);
            self.onActiveProjectChanged.emit();

        });
        
    });

}

ProjectState.prototype.saveProject = function() {

    if (!this.isPersisted()) {
        throw new Error("can't save project - no path");
    }

    return this.saveProjectAs(this.getProjectPath());

}

ProjectState.prototype.saveProjectAs = function(newPath) {

    if (this._project === null) {
        throw new Error("can't save - no active project");
    }

    this._project.save(newPath, this.getProjectPath(), function() {
        this.onProjectSaved.emit();
    }.bind(this));

}

function teardown(self) {

    if (!self._project)
        return;

    self._project.teardown();
    self._project = null;
    
    self._root.setRootWidget(null);
    self._root.setToolbar(null);
    self._root.showToolbar();

}

function setActiveProject(self, project) {

    if (self._project)
        teardown(self);

    self._project = project;
    self._project.setup({
        rootPane: self._root
    });
}

function createNewProject(self, mode) {
    var Mode = lib('modes/' + mode);
    return new Mode();
}

module.exports = ProjectState;