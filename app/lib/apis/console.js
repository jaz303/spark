var API = lib('api');

module.exports = API.extend(function(_sc, _sm) {

    return [

        function(console) {
            this._console = console;
        },

        'methods', {
            doInstall: function(ctx) {

                var console = this._console;

                ctx.def('print', {
                    params: ['message:string'],
                    docs: "Prints $message to the console",
                    fn: function(message) {
                        console.print(message);
                    }
                });

            }
        }

    ];

});