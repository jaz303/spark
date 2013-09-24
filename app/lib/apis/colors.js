var API = lib('api');

module.exports = API.extend(function(_sc, _sm) {

    return [

        function() {},

        'methods', {
            install: function(ctx) {

                ctx.def('rgb', {
                    params: [
                        ['r:number', 'g:number', 'b:number'],
                        ['r:number', 'g:number', 'b:number', 'a:number']
                    ],
                    docs: "...",
                    fn: function(r, g, b, a) {
                        if (typeof a == 'undefined') {
                            return 'rgb(' + r + ',' + g + ',' + b + ')';
                        } else {
                            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
                        }
                    }
                });

                ctx.def('hsl', {
                    params: [
                        ['h:number', 's:number', 'l:number'],
                        ['h:number', 's:number', 'l:number', 'a:number']
                    ],
                    docs: "...",
                    fn: function(h, s, l, a) {
                        if (typeof a == 'undefined') {
                            return 'hsl(' + h + ',' + (s * 100) + '%,' + (l * 100) + '%)';
                        } else {
                            return 'hsla(' + h + ',' + (s * 100) + '%,' + (l * 100) + '%,' + a + ')';
                        }
                    }
                });

                //
                // TODO: more constants

                ctx.constant('RED',    '#ff0000');
                ctx.constant('GREEN',  '#00ff00');
                ctx.constant('BLUE',   '#0000ff');
                ctx.constant('WHITE',  '#ffffff');
                ctx.constant('BLACK',  '#000000');

            }
        }

    ];

});