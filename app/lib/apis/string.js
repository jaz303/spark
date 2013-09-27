var API = lib('api');

module.exports = API.extend(function(_sc, _sm) {

    return [

        function() {},

        'methods', {
            doInstall: function(ctx) {

                ctx.def('join', {
                    params: ['list:any[]', 'separator:string'],
                    docs: "...",
                    fn: function(list, separator) {
                        return list.join(separator);
                    }
                });

                ctx.def('match', {
                    params: ['str:string', 'regexp:regexp'],
                    docs: "...",
                    fn: function(str, regexp) {
                        return str.match(regexp);
                    }
                });

                // TODO: matchAll
                // TODO: nf
                // TODO: nfc
                // TODO: nfp
                // TODO: nfs

                ctx.def('split', {
                    params: ['str:string', 'separator:string'],
                    docs: "...",
                    fn: function(str, separator) {
                        return str.split(separator);
                    }
                });

            }
        }

    ];

});