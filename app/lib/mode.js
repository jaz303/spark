var Class   = require('classkit').Class;

var fs      = require('fs'),
    path    = require('path');

var pio     = lib('project_io');

module.exports = Class.extend(function(_sc, _sm) {

    return [

        function() {
            this.path = null;
        },

        'methods', {

            //
            // Mode ID

            id: null,

            //
            // Lifecycle

            // Called when a new project is being created, rather than being opened
            new: function() {
                // no-op
            },

            // Set up this mode inside the given UI
            // `ui` is an object. It currently contains just a single property, `rootPane`.
            // when loading a saved project, setup() is always called after open()
            setup: function(ui) {
                throw new Error("you must override Mode.prototype.setup()");
            },

            // Tear down this mode. Cancel all timers, destroy UI etc.
            teardown: function() {

            },

            //
            // Persistence

            isPersisted: function() { return this.path !== null; },
            getPath: function() { return this.path; },

            open: function(path, cb) {

                var self = this;

                fs.readFile(pio.projectFile(path), {encoding: 'utf8'}, function(err, json) {

                    if (err) {
                        cb(err);
                        return;
                    }

                    try {
                        var data = JSON.parse(json);
                    } catch (err) {
                        cb(err);
                        return;
                    }

                    if (data.mode !== self.id) {
                        cb(new Error("mode ID mismatch"));
                        return;
                    }

                    try {
                        self._setState(data);
                    } catch (err) {
                        cb(err);
                        return;
                    }

                    self._loadState(path, function(err) {
                        if (err) {
                            cb(err);
                        } else {
                            self.path = path;
                            cb();
                        }
                    });

                });

            },

            save: function(path, oldPath, cb) {

                var self = this;

                var state = this._getState();
                state.mode = this.id;

                var serializedState = JSON.stringify(state, null, 4);

                fs.writeFile(pio.projectFile(path), serializedState, {encoding: 'utf8'}, function(err) {

                    if (err) {
                        cb(err);
                        return;
                    }

                    self._saveState(path, oldPath, function(err) {
                        if (err) {
                            cb(err);
                        } else {
                            self.path = path;
                            cb();
                        }
                    });

                });

            },
            
            //
            // Override points for serialisation

            // Install state, as deserialized from project.json
            // No need to do mode ID check, this is done already
            _setState: function(state) {
                // no-op
            },

            // Load any additional state (e.g. images, audio) from `path`.
            // Always called after `_setState()`
            _loadState: function(path, cb) {
                process.nextTick(cb);
            },

            // Return project.json as object structure. Must be serializable to JSON.
            // No need to insert mode ID.
            _getState: function() {
                return {};
            },

            // Save any additional state (e.g. images, audio) to `path`.
            // If oldPath is not-null, this is a "save as" operation and oldPath
            // points to the previous save path - useful if you need to copy files.
            _saveState: function(path, oldPath, cb) {
                process.nextTick(cb);
            }
        
        }

    ];

});