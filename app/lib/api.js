var Class = require('classkit').Class;

module.exports = Class.extend(function(_sc, _sm) {

    return [
        function() {},

        'methods', {
            install: function(ctx) {
                this._teardown = [];
                this.doInstall(ctx);
            },

            doInstall: function(ctx) {},
            
            uninstall: function(ctx) {
                this._teardown.forEach(function(cb) {
                    cb();
                })
            },

            bind: function(el, event, fn) {
                el.addEventListener(event, fn);
                this._teardown.push(function() {
                    el.removeEventListener(event, fn);
                });
            }
        }
    ];

});