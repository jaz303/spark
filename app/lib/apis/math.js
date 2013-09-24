var API = lib('api');

module.exports = API.extend(function(_sc, _sm) {

    return [

        function() {},

        'methods', {
            install: function(ctx) {

                ctx.constant('E',          Math.E);
                ctx.constant('LN2',        Math.LN2);
                ctx.constant('LN10',       Math.LN10);
                ctx.constant('LOG2E',      Math.LOG2E);
                ctx.constant('LOG10E',     Math.LOG10E);
                ctx.constant('QUARTER_PI', Math.PI / 4);
                ctx.constant('HALF_PI',    Math.PI / 2);
                ctx.constant('PI',         Math.PI);
                ctx.constant('TWO_PI',     Math.PI * 2);

                ctx.def('abs', {
                    params: ['x:number'],
                    docs: "Returns the absolute value of $x",
                    fn: Math.abs
                });

                ctx.def('ceil', {
                    params: ['x:number'],
                    docs: "Returns $x, rounded upwards to the nearest integer",
                    fn: Math.ceil
                });

                ctx.def('floor', {
                    params: ['x:number'],
                    docs: "Returns $x, rounded downwards to the nearest integer",
                    fn: Math.floor
                });

                ctx.def('round', {
                    params: ['x:number'],
                    docs: "Rounds $x to the nearest integer",
                    fn: Math.round
                });

                ctx.def('exp', {
                    params: ['x:number'],
                    docs: "Calculates the value of E<sup>$x</sup>",
                    fn: Math.exp
                });

                ctx.def('log', {
                    params: ['x:number'],
                    docs: "Calculates the natural logarithm (base E) of $x",
                    fn: Math.log
                });

                ctx.def('pow', {
                    params: ['x:number', 'y:number'],
                    docs: "Calculates the value of $x to the power of $y",
                    fn: Math.pow
                });

                ctx.def('cos', {
                    params: ['x:number'],
                    docs: "Calculates the cosine of $x, where $x is an angle expressed in radians",
                    fn: Math.cos
                });

                ctx.def('sin', {
                    params: ['x:number'],
                    docs: "Calculates the sine of $x, where $x is an angle expressed in radians",
                    fn: Math.sin
                });

                ctx.def('tan', {
                    params: ['x:number'],
                    docs: "Calculates the tanget of $x, where $x is an angle expressed in radians",
                    fn: Math.tan
                });

                ctx.def('acos', {
                    params: ['x:number'],
                    docs: "Calculates the arccosine of $x, in radians",
                    fn: Math.acos
                });

                ctx.def('asin', {
                    params: ['x:number'],
                    docs: "Calculates the arcsine of $x, in radians",
                    fn: Math.asin
                });

                ctx.def('atan', {
                    params: ['x:number'],
                    docs: "Calculates the arctangent of $x, in radians",
                    fn: Math.atan
                });

                ctx.def('atan2', {
                    params: ['y:number', 'x:number'],
                    docs: "Calculates the arctangent of the quotient of $y and $x",
                    fn: Math.atan2
                });

                ctx.def('random', {
                    params: [
                        [],
                        ['max:number'],
                        ['min:number', 'max:number']
                    ],
                    docs: "...",
                    fn: function(min, max) {
                        if (typeof min == 'undefined') {
                            return Math.random();
                        } else if (typeof max == 'undefined') {
                            return Math.floor(Math.random() * min);
                        } else {
                            return min + Math.floor(Math.random() * ((max - min) + 1));
                        }
                    },
                    aliases: ['rand']
                });

                ctx.def('min', {
                    params: [
                        ['xs:number[]'],
                        ['x+:number']
                    ],
                    docs: "...",
                    fn: function(ary) {
                        if (Array.isArray(ary)) {
                            return Math.min.apply(null, ary);
                        } else {
                            return Math.min.apply(null, arguments);
                        }
                    }
                });

                ctx.def('max', {
                    params: [
                        ['xs:number[]'],
                        ['x+:number']
                    ],
                    docs: "...",
                    fn: function(ary) {
                        if (Array.isArray(ary)) {
                            return Math.max.apply(null, ary);
                        } else {
                            return Math.max.apply(null, arguments);
                        }
                    }
                });

                ctx.def('lerp', {
                    params: ['start:number', 'stop:number', 'amt:number'],
                    docs: "...",
                    fn: function(start, stop, amt) {
                        return start + (stop - start) * amt;
                    }
                });

                ctx.def('sq', {
                    params: ['x:number'],
                    docs: "Calculates $x squared",
                    fn: function(x) { return x * x }
                });

                ctx.def('sqrt', {
                    params: ['x:number'],
                    docs: "Calculates the square root of $x",
                    aliases: ['squareRoot', 'squareroot'],
                    fn: Math.sqrt
                });

                ctx.def('clamp', {
                    params: ['x:number', 'min:number', 'max:number'],
                    docs: "Returns $x, adjusted so that it is between $min and $max",
                    fn: function(x, min, max) {
                        if (x < min) x = min;
                        if (x > max) x = max;
                        return x;
                    }
                });

            }
        }

    ];

});