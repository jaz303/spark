var Class = require('classkit').Class;

module.exports = Class.extend(function(_sc, _sm) {

    return [

        function() {

        },

        'methods', {
            id: null,

            setup: function(rootPane) {
                throw new Error("you must implement Mode::setup()");
            },

            teardown: function() {

            },

            getState: function() {
                return {};
            },

            setState: function(state) {
                
            }
        }

    ];

});