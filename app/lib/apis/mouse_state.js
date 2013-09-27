var API = lib('api');

module.exports = API.extend(function(_sc, _sm) {

    return [

        function(canvas) {
            this._canvas = canvas;
        },

        'methods', {
            doInstall: function(ctx) {

                var mouseX                  = 0,
                    mouseY                  = 0,
                    mouseButtonIsDown       = false,
                    leftMouseButtonIsDown   = false,
                    middleMouseButtonIsDown = false,
                    rightMouseButtonIsDown  = false;

                this.bind(this._canvas, 'mousemove', function(evt) {
                    mouseX = evt.offsetX;
                    mouseY = evt.offsetY;
                });

                this.bind(this._canvas, 'mousedown', function(evt) {
                    if (evt.button === 0) {
                        leftMouseButtonIsDown = true;
                    } else if (evt.button === 1) {
                        middleMouseButtonIsDown = true;
                    } else if (evt.button === 2) {
                        rightMouseButtonIsDown = true;
                    }
                    mouseButtonIsDown = leftMouseButtonIsDown || middleMouseButtonIsDown || rightMouseButtonIsDown;
                });

                this.bind(this._canvas, 'mouseup', function(evt) {
                    if (evt.button === 0) {
                        leftMouseButtonIsDown = false;
                    } else if (evt.button === 1) {
                        middleMouseButtonIsDown = false;
                    } else if (evt.button === 2) {
                        rightMouseButtonIsDown = false;
                    }
                    mouseButtonIsDown = leftMouseButtonIsDown || middleMouseButtonIsDown || rightMouseButtonIsDown;
                });

                ctx.getter('mouseX', {
                    docs: "Mouse's current X co-ordinate",
                    fn: function() { return mouseX; }
                });

                ctx.getter('mouseY', {
                    docs: "Mouse's current Y co-ordinate",
                    fn: function() { return mouseX; }
                });

                ctx.getter('mouseButtonIsDown', {
                    docs: "True if any mouse button is down",
                    fn: function() { return mouseButtonIsDown; }
                });

                ctx.getter('leftMouseButtonIsDown', {
                    docs: "True if the left mouse button is down",
                    fn: function() { return leftMouseButtonIsDown; }
                });

                ctx.getter('middleMouseButtonIsDown', {
                    docs: "True if the middle mouse button is down",
                    fn: function() { return middleMouseButtonIsDown; }
                });

                ctx.getter('rightMouseButtonIsDown', {
                    docs: "True if the right mouse button is down",
                    fn: function() { return rightMouseButtonIsDown; }
                });

            }

        }

    ];

});