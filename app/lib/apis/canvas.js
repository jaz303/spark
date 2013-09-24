var API = lib('api');

module.exports = API.extend(function(_sc, _sm) {

    return [

        function(canvas) {
            this._canvas = canvas;
            this._ctx = canvas.getContext('2d');
        },

        'methods', {
            install: function(c) {

                function loadIdentity() {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                }
                
                function parseColor(v) {
                    return v;
                }

                var ctx = this._ctx,
                    canvas = this._canvas;
                
                var lastX = 0,
                    lastY = 0,
                    textX = 0,
                    textY = 0;
                
                var filling = true,
                    stroking = false,
                    fontSize = 12;

                loadIdentity();

                ctx.strokeStyle = 'white';
                ctx.fillStyle = 'white';
                ctx.lineWidth = 1;
                ctx.font = fontSize + 'px monospace';
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                c.def('clear', {
                    params: [
                        [],
                        ['x:number', 'y:number', 'w:number', 'h:number']
                    ],
                    fn: function(x, y, w, h) {
                        if (arguments.length == 0) {
                            ctx.save();
                            loadIdentity();
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.restore();
                        } else if (arguments.length == 4) {
                            ctx.clearRect(x, y, w, h);
                        } else {
                            throw "ArgumentError";
                        }
                    }
                });

                c.def('save', {
                    fn: function() {
                        ctx.save();
                    }
                });

                c.def('restore', {
                    fn: function() {
                        ctx.restore();
                    }
                });

                //
                // Text Drawing

                c.def('locate', {
                    params: ['x:number', 'y:number'],
                    docs: "...",
                    fn: function(x, y) {
                        textX = x;
                        textY = y;
                    }
                });

                // TODO: alignment, bounding boxes, flowing etc
                c.def('write', {
                    params: [
                        ['str:string'],
                        ['x:number', 'y:number', 'str:string']
                    ],
                    docs: "...",
                    fn: function(x, y, str) {
                        if (arguments.length == 1) {
                            str = x;
                        } else if (arguments.length == 3) {
                            textX = x;
                            textY = y;
                        }
                        if (filling)  ctx.fillText(str, textX, textY + fontSize);
                        if (stroking) ctx.strokeText(str, textX, textY + fontSize);
                        textY += fontSize;
                    }
                });

                c.def('fontSize', {
                    params: ['size:number'],
                    aliases: ['fontsize'],
                    docs: "...",
                    fn: function(size) {
                        fontSize = size;
                        ctx.font = size + 'px monospace';
                    }
                });

                //
                // Drawing primitives

                c.def('paper', {
                    params: ['color:color'],
                    docs: "...",
                    fn: function(v) {
                        canvas.style.backgroundColor = parseColor(v);
                    }
                })

                c.def('pen', {
                    params: [
                        [],
                        ['state:boolean'],
                        ['state:boolean', 'lineWidth:number'],
                        ['color:color'],
                        ['color:color', 'lineWidth:number']
                    ],
                    docs: "...",
                    fn: function(v, lineWidth) {
                        if (typeof v === 'undefined') {
                            stroking = true;
                        } else if (v === true || v === false) {
                            stroking = v;
                        } else {
                            ctx.strokeStyle = parseColor(v);
                            stroking = true;
                        }
                        if (typeof lineWidth !== 'undefined') {
                            ctx.lineWidth = lineWidth;
                        }
                    }
                });

                c.def('lineWidth', {
                    params: ['width:number'],
                    aliases: ['linewidth'],
                    docs: "...",
                    fn: function(width) {
                        ctx.lineWidth = width;
                    }
                });

                c.def('fill', {
                    params: [
                        [],
                        ['state:boolean'],
                        ['color:color']
                    ],
                    docs: "...",
                    fn: function(v) {
                        if (typeof v == 'undefined') {
                            filling = true;
                        } else if (v === true || v === false) {
                            filling = v;
                        } else {
                            ctx.fillStyle = parseColor(v);
                            filling = true;
                        }
                    }
                });

                c.def('noPen', {
                    params: [],
                    aliases: ['nopen'],
                    docs: "...",
                    fn: function() { stroking = false; }
                });

                c.def('noFill', {
                    params: [],
                    aliases: ['nofill'],
                    docs: "...",
                    fn: function() { filling = false; }
                });

                c.def('moveTo', {
                    params: ['x:number', 'y:number'],
                    aliases: ['moveto'],
                    docs: "Moves the drawing to cursor to point ($x,$y)",
                    fn: function(x, y) {
                        lastX = x;
                        lastY = y;
                    }
                });

                function lineTo(x, y) {
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(x, y);
                    ctx.closePath();
                    ctx.stroke();
                    lastX = x;
                    lastY = y;
                }

                c.def('line', {
                    params: ['x1:number', 'y1:number', 'x2:number', 'y2:number'],
                    docs: "Draws a line from ($x1,$y1) to ($x2,$y2)",
                    fn: function(x1, y1, x2, y2) {
                        lastX = x1;
                        lastY = y1;
                        lineTo(x2, y2);
                    }
                });

                c.def('lineTo', {
                    params: ['x:number', 'y:number'],
                    docs: "Draws a line from the current drawing position to ($x,$y)",
                    aliases: ['lineto'],
                    fn: lineTo
                });

                // TODO: support multiple arc modes, like in processing
                c.def('arc', {
                    params: [
                        ['cx:number', 'cy:number', 'radius:number', 'startAngle:number', 'endAngle:number'],
                        ['cx:number', 'cy:number', 'radius:number', 'startAngle:number', 'endAngle:number', 'antiClockwise:boolean']
                    ],
                    docs: "...",
                    fn: function(cx, cy, radius, startAngle, endAngle, antiClockwise) {
                        ctx.beginPath();
                        ctx.arc(cx, cy, radius, startAngle, endAngle, antiClockwise);
                        ctx.closePath();
                        if (filling)  ctx.fill();
                        if (stroking) ctx.stroke();
                    }
                });

                // TODO: ellipse
                // TODO: quadratic curves
                // TODO: bezier curves

                c.def('circle', {
                    params: ['cx:number', 'cy:number', 'radius:number'],
                    docs: "...",
                    fn: function(cx, cy, radius) {
                        ctx.beginPath();
                        ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
                        ctx.closePath();
                        if (filling)  ctx.fill();
                        if (stroking) ctx.stroke();
                    }
                });

                c.def('quad', {
                    params: ['x1:number', 'y1:number', 'x2:number', 'y2:number', 'x3:number', 'y3:number'],
                    aliases: ['quadrilateral'],
                    docs: "...",
                    fn: function(x1, y1, x2, y2, x3, y3, x4, y4) {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.lineTo(x3, y3);
                        ctx.lineTo(x4, y4);
                        ctx.lineTo(x1, y1);
                        ctx.closePath();
                        if (filling)  ctx.fill();
                        if (stroking) ctx.stroke();
                    }
                });

                c.def('rectangle', {
                    params: ['x:number', 'y:number', 'w:number', 'h:number'],
                    docs: "...",
                    fn: function(x, y, w, h) {
                        if (filling)  ctx.fillRect(x, y, w, h);
                        if (stroking) ctx.strokeRect(x, y, w, h);
                    }
                });

                c.def('triangle', {
                    params: ['x1:number', 'y1:number', 'x2:number', 'y2:number', 'x3:number', 'y3:number'],
                    docs: "...",
                    fn: function(x1, y1, x2, y2, x3, y3) {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.lineTo(x3, y3);
                        ctx.lineTo(x1, y1);
                        ctx.closePath();
                        if (filling)  ctx.fill();
                        if (stroking) ctx.stroke();
                    }
                });

                c.def('square', {
                    params: ['x:number', 'y:number', 'size:number'],
                    docs: "...",
                    fn: function(x, y, size) {
                        if (filling)  ctx.fillRect(x, y, size, size);
                        if (stroking) ctx.strokeRect(x, y, size, size);
                    }
                });

                //
                // Transformations

                // TODO: shearX, shearY

                c.def('translate', {
                    fn: function(x, y) {
                        ctx.translate(x, y);
                    }
                });

                c.def('scale', {
                    fn: function(x, y) {
                        if (arguments.length < 2) y = x;
                        ctx.scale(x, y);
                    }
                });

                c.def('rotate', {
                    fn: function(angle) {
                        ctx.rotate(angle);
                    }
                });

                c.def('identity', {
                    params: [],
                    docs: "...",
                    fn: function() {
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                    }
                });

                c.def('transform', {
                    params: ['m11:number', 'm12:number', 'm21:number', 'm22:number', 'dx:number', 'dy:number'],
                    docs: "...",
                    fn: function(m11, m12, m21, m22, dx, dy) {
                        ctx.transform(m11, m12, m21, m22, dx, dy);
                    }
                });

                c.def('setTransform', {
                    params: ['m11:number', 'm12:number', 'm21:number', 'm22:number', 'dx:number', 'dy:number'],
                    aliases: ['settransform'],
                    docs: "...",
                    fn: function(m11, m12, m21, m22, dx, dy) {
                        ctx.setTransform(m11, m12, m21, m22, dx, dy);
                    }
                });

                c.getter('width',   function() { return canvas.width; });
                c.getter('height',  function() { return canvas.height; });
                c.getter('ctx',     function() { return ctx; });

            }
        }

    ];

});