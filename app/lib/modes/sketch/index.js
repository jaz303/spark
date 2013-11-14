var Mode            = lib('mode'),
    JSContext       = lib('js_context'),
    findGlobals     = lib('find_globals');
    
var CanvasAPI       = lib('apis/canvas'),
    ConsoleAPI      = lib('apis/console'),
    MathAPI         = lib('apis/math'),
    ColorsAPI       = lib('apis/colors'),
    StringAPI       = lib('apis/string'),
    MouseStateAPI   = lib('apis/mouse_state');

var fs              = require('fs'),
    path            = require('path');

var hk              = require('hudkit'),
    slowpoke        = require('slowpoke'),
    esprima         = require('esprima'),
    escodegen       = require('escodegen'),
    beautify        = require('js-beautify').js_beautify;

var SKELETON = [
    "function setup() {",
    "",
    "}",
    "",
    "function loop(delta, totalTime) {",
    "    clear();",
    "    save();",
    "    // sketch code here",
    "    restore();",
    "}",
    ""
].join("\n");

module.exports = Mode.extend(function(_sc, _cm) {

    return [

        function() {
            _sc.call(this);
        },

        'methods', {

            //
            // ID

            id: 'sketch',

            new: function() {
                this._sourceFiles = ['main.js'];
                this._initialSource = {'main.js': SKELETON};
            },

            _getState: function() {
                return {source: this._sourceFiles};
            },

            _setState: function(state) {

                if (!Array.isArray(state.source)) {
                    throw new Error("no source file(s) found");
                    return;
                }

                this._sourceFiles = state.source;

            },

            _loadState: function(projectPath, cb) {

                var self        = this,
                    wasError    = false,
                    remain      = this._sourceFiles.length;

                if (remain === 0) {
                    this._sourceFiles = ['main.js'];
                    this._initialSource = {'main.js': ''};
                    process.nextTick(cb);
                    return;
                }

                this._initialSource = {};

                this._sourceFiles.forEach(function(file) {
                    fs.readFile(path.join(projectPath, file), {encoding: 'utf8'}, function(err, src) {

                        if (wasError)
                            return;

                        if (err) {
                            wasError = true;
                            cb(err);
                            return;
                        }

                        self._initialSource[file] = src;

                        if (--remain === 0) {
                            cb();
                        }
                    
                    });
                });

            },

            _saveState: function(projectPath, oldProjectPath, cb) {

                var self        = this,
                    wasError    = false,
                    remain      = this._sourceFiles.length;

                if (remain === 0) {
                    process.nextTick(cb);
                    return;
                }

                this._sourceFiles.forEach(function(file) {

                    // Just use the same source for all atm because we really
                    // only support a single file :)
                    var fileSource = self._editor.getValue();

                    fs.writeFile(path.join(projectPath, file), fileSource, {encoding: 'utf8'}, function(err, src) {

                        if (wasError)
                            return;

                        if (err) {
                            wasError = true;
                            cb(err);
                            return;
                        }

                        if (--remain === 0) {
                            cb();
                        }

                    });

                });

            },

            //
            //

            setup: function(ui) {

                var rootPane = ui.rootPane;

                var self = this;

                //
                // Actions

                this._actStart = hk.action(function() {
                    self.start();
                }, {title: 'Start'});

                this._actStop = hk.action(function() {
                    self.stop();
                }, {title: 'Stop'});

                this._actReset = hk.action(function() {
                    self.reset();
                }, {title: 'Reset'});

                this._actReformat = hk.action(function() {
                    self._reformat();
                }, {title: 'Reformat'});

                //
                // UI

                // Docs/Props/Parameters

                var toolSplit = new hk.SplitPane();
                toolSplit.setOrientation(hk.SPLIT_PANE_HORIZONTAL);

                var documentationBrowser = new hk.Box();
                documentationBrowser.setBackgroundColor('#AAB2B8');

                var propsBrowser = new hk.Box();
                propsBrowser.setBackgroundColor('#AAB2B8');

                var parametersViewer = new hk.Box();
                parametersViewer.setBackgroundColor('#AAB2B8');

                var toolTabs = new hk.TabPane();
                toolTabs.addTab('Props', propsBrowser);
                toolTabs.addTab('Parameters', parametersViewer);

                toolSplit.setTopWidget(documentationBrowser);
                toolSplit.setBottomWidget(toolTabs);
                toolSplit.setSplit(0.7);

                // Editor/canvas/REPL
                
                var outerSplit  = new hk.SplitPane(),
                    rightSplit  = new hk.SplitPane();

                this._ctx = new JSContext();

                this._toolbar = new hk.Toolbar();
                this._editor = new hk.CodeEditor();
                this._canvas = new hk.Canvas2D();
                this._console = new hk.Console();

                var tabs = new hk.TabPane();
                tabs.addTab('Canvas', this._canvas);

                this._toolbar.addAction(this._actStart);
                this._toolbar.addAction(this._actStop);
                this._toolbar.addAction(this._actReset);
                this._toolbar.addAction(this._actReformat);

                outerSplit.setOrientation(hk.SPLIT_PANE_VERTICAL);
                rightSplit.setOrientation(hk.SPLIT_PANE_HORIZONTAL);

                outerSplit.setLeftWidget(this._editor);
                outerSplit.setRightWidget(rightSplit);
                outerSplit.setSplit(0.45);

                rightSplit.setTopWidget(tabs);
                rightSplit.setBottomWidget(this._console);
                rightSplit.setSplit(0.7);

                // Pull it all together

                var outerSplitRatioWhenToolsVisible = null;
                var outerSplitRatioWhenToolsInvisible = null;
                var toolsVisible = false;

                var masterContainer = new hk.Panel();
                var masterButtons = new hk.ButtonBar();

                var toggleToolsButton = new hk.Button();
                toggleToolsButton.setAction(hk.action(function() {
                    if (toolsVisible) {
                        outerSplitRatioWhenToolsVisible = outerSplit.getSplit();
                        masterSplit.hideWidgetAtIndex(0);
                        if (outerSplitRatioWhenToolsInvisible !== null) {
                            outerSplit.setSplit(outerSplitRatioWhenToolsInvisible);
                        }
                    } else {
                        outerSplitRatioWhenToolsInvisible = outerSplit.getSplit();
                        masterSplit.showWidgetAtIndex(0);
                        if (outerSplitRatioWhenToolsVisible !== null) {
                            outerSplit.setSplit(outerSplitRatioWhenToolsVisible);
                        }
                    }
                    toolsVisible = !toolsVisible;
                }));

                masterButtons.addButton(toggleToolsButton);

                var masterSplit = new hk.SplitPane();
                masterSplit.setOrientation(hk.SPLIT_PANE_VERTICAL);
                masterSplit.setLeftWidget(toolSplit);
                masterSplit.setRightWidget(outerSplit);
                masterSplit.setSplit(0.32);
                masterSplit.hideWidgetAtIndex(0);

                masterContainer.addChild('buttons', masterButtons);
                masterContainer.addChild('split', masterSplit);
                masterContainer.setLayout(function(c, x, y, width, height) {
                    c.buttons.setBounds(0, 0, 20, height);
                    c.split.setBounds(28, 0, width - 28, height);
                });

                rootPane.setToolbar(this._toolbar);
                rootPane.setRootWidget(masterContainer);

                //
                // Skeleton

                this._editor.setValue(this._initialSource[this._sourceFiles[0]]);
                this._initialSource = null;

                //
                // APIs

                this._ctx.addAPI(new CanvasAPI(this._canvas.getCanvas()));
                this._ctx.addAPI(new ConsoleAPI(this._console));
                this._ctx.addAPI(new MathAPI());
                this._ctx.addAPI(new ColorsAPI());
                this._ctx.addAPI(new StringAPI());
                this._ctx.addAPI(new MouseStateAPI(this._canvas.getCanvas()));
                this._installAPIs();

                //
                // Canvas Events

                var canvas = this._canvas.getCanvas();

                canvas.addEventListener('mousedown', function(evt) {
                    self._ctx.__js_mouseDown(evt.offsetX, evt.offsetY, evt.which);
                });

                canvas.addEventListener('mouseup', function(evt) {
                    self._ctx.__js_mouseUp(evt.offsetX, evt.offsetY, evt.which); 
                });

                canvas.addEventListener('mousemove', function(evt) {
                    self._ctx.__js_mouseMove(evt.offsetX, evt.offsetY, evt.which);
                });

                canvas.addEventListener('click', function(evt) {
                    self._ctx.__js_click(evt.offsetX, evt.offsetY, evt.which); 
                });

                canvas.addEventListener('keydown', function(evt) {
                    self._ctx.__js_keyDown(evt.keyCode);
                });

                canvas.addEventListener('keyup', function(evt) {
                    self._ctx.__js_keyUp(evt.keyCode);
                });

                canvas.addEventListener('keypress', function(evt) {
                    self._ctx.__js_keyPress(String.fromCharCode(evt.charCode));
                });

                //
                // Evaluation

                function isError(v) {
                    return ('' + v).match(/^\w*Error:/);
                }

                this._editor.getEditor().commands.addCommand({
                    name: "eval",
                    bindKey: {win: "Ctrl-Enter", mac: "Command-Enter"},
                    exec: function(editor) {

                        var code = null, setup = false;

                        if (editor.getSelectionRange().isEmpty()) {
                            code = editor.getValue();
                            setup = true; // if we're re-eval'ing all the code, run setup too
                        } else {
                            code = editor.getCopyText();
                        }

                        try {

                            var ast = esprima.parse(code);

                            // find globals
                            var globals = findGlobals(ast);

                            // detect slow loops
                            // TODO: make this a configuration option
                            slowpoke(ast, {timeout: 5000});

                            // regenerate code
                            code = escodegen.generate(ast);

                        } catch (e) {
                            console.log(e);
                            // Parse failed.
                            // We'll just ignore this and let the runtime throw the error.
                        }
                        
                        var result = self._ctx.evaluate(code);
                        if (isError(result)) {
                            self._console.printObject(result);    
                        } else {
                            // TODO: this is a work-around for not have global
                            // variable extraction/injection.
                            if (setup) {
                                self._ctx.__js_setup();    
                            }
                        }
                    
                    }
                });

                function formatValue(obj) {
                    if (Array.isArray(obj)) {
                        var str = '[';
                        obj.forEach(function(o, ix) {
                            if (ix) str += ', ';
                            str += formatValue(o);
                        });
                        return str + ']';
                    } else if (typeof obj === 'string') {
                        return JSON.stringify(obj);
                    } else {
                        return '' + obj;
                    }
                }

                this._console.setObjectFormatter(function(obj) {

                    if (typeof obj === 'undefined')
                        return false;

                    var node = document.createElement('div');
                    node.textContent = formatValue(obj);

                    if (isError(obj)) {
                        node.style.color = '#aa0000';
                    }

                    return node;
                
                });

                this._console.setEvaluator(function(cmd, console) {
                    console.notReady();
                    var result = self._ctx.__js_eval(cmd);
                    console.printObject(result);
                    console.ready();
                });

                //
                // Error reporting

                this._ctx.onerror.connect(function(source, err) {
                    self.stop();
                    self._console.printObject(err);
                });

                //
                // State

                this._running = false;
                this._elapsedMillis = 0;
                
                //
                // And away we go...

                this._console.print("Spark initialised, mode: sketch");
                this._console.newCommand(true);

            },

            teardown: function() {
                this.stop();
            },

            start: function() {

                if (this._running)
                    return;

                this._running = true;

                var self        = this,
                    ctx         = this._ctx;
                
                // force initial reference point to be ~1 frame behind
                // time at which next tick will execute. this ensures
                // that dt > 0.
                var lastFrame   = Date.now() - Math.floor(1000 / 60);

                window.requestAnimationFrame(function tick() {
                    
                    if (!self._running)
                        return;

                    var now     = Date.now(),
                        delta   = now - lastFrame;

                    self._elapsedMillis += delta;

                    ctx.__js_loop(delta, self._elapsedMillis);

                    lastFrame = now;
                
                    window.requestAnimationFrame(tick);

                });

            },

            stop: function() {

                if (!this._running)
                    return;

                this._running = false;
                
            },

            reset: function() {
                this.stop();
                this._elapsedMillis = 0;
                this._ctx.reset();
                this._installAPIs();
                this._ctx.evaluate(this._editor.getValue());
                this._ctx.__js_setup();
            },

            _reformat: function() {

                var editor  = this._editor.getEditor(),
                    src     = editor.getValue();

                try {
                    var formatted = beautify(src, {indent_size: 4});
                    editor.setValue(formatted, -1);
                } catch (e) {
                    // TODO: alert!
                }

            },

            _installAPIs: function() {

                //
                // First some core stuff

                var self = this;

                this._ctx.getter('elapsedMillis', {
                    docs: 'The total time that the sketch has been running, in milliseconds',
                    fn: function() { return self._elapsedMillis; }
                });

                //
                // Next add the optional APIs

                // TODO ... (refactor)

            },

        }

    ]

});