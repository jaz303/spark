var Mode        = lib('mode'),
    JSContext   = lib('js_context');

var CanvasAPI   = lib('apis/canvas'),
    ConsoleAPI  = lib('apis/console'),
    MathAPI     = lib('apis/math'),
    ColorsAPI   = lib('apis/colors'),
    StringAPI   = lib('apis/string');

var hk          = require('hudkit'),
    esprima     = require('esprima'),
    escodegen   = require('escodegen');

module.exports = Mode.extend(function(_cs, _cb) {

    return [

        function() {

        },

        'methods', {

            id: 'sketch',

            setup: function(rootPane) {

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

                //
                // UI

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

                outerSplit.setOrientation(hk.SPLIT_PANE_VERTICAL);
                rightSplit.setOrientation(hk.SPLIT_PANE_HORIZONTAL);

                outerSplit.setLeftWidget(this._editor);
                outerSplit.setRightWidget(rightSplit);
                outerSplit.setSplit(0.45);

                rightSplit.setTopWidget(tabs);
                rightSplit.setBottomWidget(this._console);
                rightSplit.setSplit(0.7);

                rootPane.setToolbar(this._toolbar);
                rootPane.setRootWidget(outerSplit);

                //
                // APIs

                this._ctx.addAPI(new CanvasAPI(this._canvas.getCanvas()));
                this._ctx.addAPI(new ConsoleAPI(this._console));
                this._ctx.addAPI(new MathAPI());
                this._ctx.addAPI(new ColorsAPI());
                this._ctx.addAPI(new StringAPI());

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

                            console.log("PARSE...");

                            var nextTimerId = 1;
                            
                            function walk(node) {

                                if (!node.body)
                                    return;

                                var body = node.body;
                                if (body.type === 'BlockStatement')
                                    body = body.body;

                                for (var i = 0, l = body.length; i < l; ++i) {
                                    var child = body[i];
                                    if (child.type === 'WhileStatement') {

                                        var timerId     = nextTimerId++,
                                            timerName   = '$__sparkWhileTimer__' + timerId,
                                            counterName = '$__sparkWhileCounter__' + timerId;

                                        //
                                        // Set up the timer

                                        var timerSetup = {
                                            type: 'DirectiveStatement',
                                            raw: "var " + timerName + " = Date.now(), " + counterName + " = 0"
                                        };

                                        body.splice(i, 0, timerSetup);
                                        i++;

                                        //
                                        // Set up the check

                                        var timerCheck = {
                                            type: 'DirectiveStatement',
                                            raw: [
                                                "if ((" + counterName + "++) & 1024) {",
                                                "  if ((Date.now() - " + timerName + ") > 5000) throw new Error('---TOOSLOW---');",
                                                "}"
                                            ].join("\n")
                                        };

                                        child.body.body.push(timerCheck);
                                    
                                    }
                                    walk(child);
                                }

                            }

                            var ast = esprima.parse(code);
                            walk(ast);

                            console.log(escodegen.generate(ast));

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
                    self._console.printObject(err);
                });

                //
                // State

                this._running = false;
                
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

                var self = this,
                    ctx = this._ctx;

                // var lastSecond = Date.now(),
                //     frameCount = 0;

                window.requestAnimationFrame(function tick() {
                    
                    if (!self._running)
                        return;

                    // frameCount++;
                    // var now = Date.now();
                    // if (now - lastSecond > 1000) {
                    //     console.log("FPS: " + frameCount);
                    //     lastSecond = now;
                    //     frameCount = 0;
                    // }
                    
                    ctx.__js_loop();
                
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
                this._ctx.reset();
                this._ctx.evaluate(this._editor.getValue());
                this._ctx.__js_setup();
            },

            getState: function() {
                return {
                    code: this._editor.getValue().split("\n")
                };
            },

            setState: function(state) {

                var code = state.code;
                if (Array.isArray(code)) {
                    code = code.join("\n");
                }

                this._editor.setValue(code || '');
            
            }

        }

    ]

});