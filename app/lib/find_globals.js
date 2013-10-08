module.exports = findGlobals;

// takes an esprima-generated AST and finds all explicitly declared
// global variables and functions. returns an object containing arrays
// variables/functions, plus a lookup object mapping symbols to their
// types (i.e. "variable"/"function")
function findGlobals(ast) {

    var symbols = {};
    
    if (ast.type === 'Program') {
        ast.body.forEach(function(node) {
            if (node.type === 'VariableDeclaration') {
                node.declarations.forEach(function(dec) {
                    symbols[dec.id.name] = 'variable';
                });
            } else if (node.type === 'FunctionDeclaration') {
                symbols[node.id.name] = 'function';
            }
        });
    }

    var variables = [], functions = [];

    for (var k in symbols) {
        if (symbols[k] === 'variable') {
            variables.push(k);
        } else {
            functions.push(k);
        }
    }

    return {
        'symbols'   : symbols,
        'variables' : variables,
        'functions' : functions
    };

};