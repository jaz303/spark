var vm = require('vm');
var signal = require('signalkit');

// these functions are changed back into source code via
// Function.prototype.toString and then injected into the sandbox.
var builtins = {
    __makeInjector__: function() {
        var global = this;
        
        __export__('defineProperty', function(name, spec) {
            Object.defineProperty(global, name, spec);
        });
        
        __export__('delete', function(key) {
            delete global[key];
        });
        
        __export__('loop', function() {
            if (typeof loop === 'function') {
                try {
                    loop();
                } catch (e) {
                    __error__('loop', e);
                }
            }
        });
        
        __export__('setup', function() {
            if (typeof setup === 'function') {
                try {
                    setup();
                } catch (e) {
                    __error__('setup', e);
                }
            }
        });

        // yo dawg etc
        __export__('eval', function(code) {
            try {
                return eval(code);
            } catch (e) {
                __error__('eval', e);
            }
        });
    }
};

function JSContext() {
    this._ctx = null;
    this._apis = [];
    this.reset();
    this.onerror = signal('onerror');
}

JSContext.prototype.def = function(name, spec) {

    if (typeof spec.fn == 'function') {
        spec.fn.__inspectible = true;
        spec.fn.__name = name;
        spec.fn.__params = spec.params || [];
        spec.fn.__docs = spec.docs || '';
    }

    var propObj = {
        enumerable  : true,
        writable    : false,
        value       : spec.fn
    };

    this.__js_defineProperty(name, propObj);
    
    var aliases = spec.aliases || [];
    for (var i = 0; i < aliases.length; ++i) {
        this.__js_defineProperty(aliases[i], propObj);
    }

}

JSContext.prototype.constant = function(name, value) {

    this.__js_defineProperty(name, {
        enumerable  : true,
        writable    : false,
        value       : value
    });

}

JSContext.prototype.getter = function(name, fn) {

    this.__js_defineProperty(name, {
        enumerable  : true,
        get         : fn
    });

}

JSContext.prototype.reset = function() {

    var self = this;

    function _export(key, value) {
        self['__js_' + key] = value;
    }

    function _error(source, err) {
        self.onerror.emit(source, err);
    }

    var env = { __export__: _export, __error__: _error };

    this._ctx = vm.createContext(env);

    for (var k in builtins) {
        vm.runInContext(k + ' = ' + builtins[k].toString(), this._ctx);
    }

    vm.runInContext('__makeInjector__();', this._ctx);
    this.__js_delete('__makeInjector__');

    for (var i = 0; i < this._apis.length; ++i) {
        this._apis[i].install(this);
    }

}

JSContext.prototype.evaluate = function(code) {
    try {
        return vm.runInContext(code, this._ctx);
    } catch (e) {
        this.onerror.emit('evaluate', e);
        return undefined;
    }
}

JSContext.prototype.addAPI = function(api) {
    this._apis.push(api);
    api.install(this);
}

module.exports = JSContext;