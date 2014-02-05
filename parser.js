var _string = Parsimmon.string;
var regexNoWs = Parsimmon.regex;
var succeed = Parsimmon.succeed;
var seq = Parsimmon.seq;
var lazy = Parsimmon.lazy;
var optWhitespace = Parsimmon.optWhitespace;

var prefixes = ['precision'];
var precisions = ['lowp', 'mediump', 'highp'];
var keywords = ['uniform', 'varying', 'const', 'mediump', 'lowp', 'highp'];
var types = [ 'bool', 'int', 'float', 'vec2', 'vec3', 'vec4', 'bvec2', 'bvec3', 'bvec4', 'ivec2', 'ivec3', 'ivec4', 'mat2', 'mat3', 'mat4', 'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler2DShadow' ];
var infixOperators = [ '*', '+', '<<', '>>', '<', '>', '<=', '>=', '==', '!=', '&', '^', '|', '&&', '||' ];

var assignmentInfix = [ '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '^=', '|=' ];

var fnReturnTypes = ['void'].concat( types );

var json = (function() {

    var escapeRegex = function( str ) {
        return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    };

    var listToRegex = function( list ) {
        var regex = [];
        for( var x = 0; x < list.length; x++ ) {
            regex.push( escapeRegex( list[x] ) );
        }
        return new RegExp( '^' + regex.join('|') );
    };

    //
    // Language agnostic helper functions
    //
    var between = function( left, right, parser ) {
        return left.then( parser ).skip( right );
    };

    var parenthed = function( parser ) {
        return between(string('('), string(')'), parser);
    };

    var nippled = function( parser ) {
        return between(string('{'), string('}'), parser);
    };

    var commaSep = function( parser ) {
        var commaParser = string(',').then(parser).many();
        return seq([parser, commaParser]).map(function(results) {
            return [results[0]].concat(results[1]);
        }).or(succeed([]));
    };

    // parser, operator parser [, operator, parser ... ]
    var chainr1 = function( parser, operator ) {
        return parser.then(function(x) {
            return operator.then(function(f) {
                return chainr1(parser, operator).then(function(y) {
                    return succeed( f(x, y) );
                });
            }).or(succeed(x));
        });
    };

    var blockComment = regexNoWs( /^\/\*.*?\*\//m );
    var lineComment = regexNoWs( /^\/\/.*$/i );

    // Ignore whitespace
    var ws = function( f ) {
        return (
            regexNoWs( /\s+/ )
                .or( blockComment )
                .or( lineComment )
            ).many().then( f );
    };

    //console.log( ws( _string('pewp') ).parse("pewp") );
    //throw 'shit';

    // Can this be done better?
    var string = function(s) {
        return ws( _string(s) );
    };
    var regex = function(r) {
        if( r instanceof Array ) {
            r = listToRegex( r );
        }
        return ws( regexNoWs(r) );
    };

    //
    // Terminators
    //

    var integer = regex(/^-?\d+/i).map(parseInt);
    var number = regex(/^-?\d+(([.]|e[+-]?)\d+)?/i).map(parseFloat);
    var stringLiteral = regex(/^"(\\.|.)*?"/).map(function(str) {
        return str.slice(1, -1);
    });
    var varName = regex(/^[a-z_][a-z0-9_]*/i).map(function(str) {
        // todo: reserved words, scope test
        return str;
    });

    var atom = lazy(function() {
        return number
            .or( integer )
            .or( stringLiteral )
            .or( varName );
    });

    var infix = function( term, operators ) {
        return chainr1( term, regex( operators ).map(function( operator ) {
            return function( left, right ) {
                return {
                    type: operator,
                    left: left,
                    right: right
                };
            };
        }));
    };

    var invocation = lazy(function() {
        return varName.then(function( name ) {
            return parenthed( commaSep( expression ) ).map(function( args ) {
                return {
                    type: 'invocation',
                    name: name,
                    first: args
                };
            });
        });
    });

    var rightFix = function( operator, left ) {
        return left.skip( string( operator ) ).map(function( name ) {
            return {
                type: operator,
                left: name
            };
        });
    };

    var leftFix = function( operator, right ) {
        return string( operator ).then( right ).map(function( name ) {
            return {
                type: operator,
                left: name
            };
        });
    };

    var pp = rightFix( '++', varName );
    var mm = rightFix( '--', varName );
    var ppl = leftFix( '++', varName );
    var mml = leftFix( '--', varName );

    var expressionBase = lazy(function() {
        return invocation
            .or( pp )
            .or( mm )
            .or( ppl )
            .or( mml )
            .or( atom )
            .or( parenthed( expression ));
    });

    var expression = lazy(function() {
        return _.reduce([
            ['||'],
            ['^^'],
            ['&&'],
            ['|'],
            ['^'],
            ['&'],
            ['==', '!='],
            ['<', '<=', '>=', '>'],
            ['<<', '>>'],
            ['+', '-'],
            ['*', '/']
        ], infix, expressionBase );
    });

    var optional = function(p) {
        return p.map(function(x) {
            return x;
        }).or(succeed());
    };

    var typeDec = seq([
        optional( regex( prefixes ) ),
        optional( regex( precisions ) ),
        optional ( regex( keywords ) ),
        regex( types ),
    ]).then(function( types ) {
        return varName.map(function( name ) {
            return {
                declerations: _.compact( types.slice( 0, -1 ) ),
                type: types[ 3 ],
                name: name
            };
        });
    });

    var assignment = typeDec.then(function( dec ) {
        return regex( assignmentInfix ).then( function() {
            return expression.map(function( op ) {
                return {
                    type: 'assignment',
                    left: dec,
                    right: op
                };
            });
        });
    });

    var block = lazy(function() {
        return nippled( statement.many() );
    });

    var functionArgs = lazy(function() {
        return parenthed( commaSep( varName ) );
    });

    var returnStatement = string('return').then(function() {
        return expression;
    }).skip( string(';').or( Parsimmon.eof ));

    var functionDecleration = seq([
        regex( fnReturnTypes ),
        varName,
        functionArgs
    ]).then(function( parts ) {
        return nippled( ( returnStatement.or( statement ) ).many() ).map(function( results ) {
            return {
                type: 'function',
                returnType: parts[0],
                name: parts[1],
                args: parts[2],
                body: results
            };
        });
    });

    var blockStatement = function( keyword, condition ) {
        return string( keyword ).then(function() {
            return parenthed( condition ).then( function( condRes ) {
                return nippled( statement.many() ).or( statement );
            });
        });
    };

    var forStatement = blockStatement( 'for', seq([
        assignment, string(';'), expression, string(';'), expression
    ]));

    var statement = (
            forStatement
            .or( functionDecleration )
            .or( assignment )
            .or( typeDec )
            .or( expression )
        ).skip( string(';').or( Parsimmon.eof ));

    var p = statement.many();

    console.log(p.parse("\
mat3 /* pewp pewp */ m3x3 = mat3(m2x2);\
uniform vec3 viewVector = 1;\n\
uniform float c = 1;\n\
uniform float p = 1;\n\
for(int i=0;i<int(uLightCount);++i) {\
    vec3 lightPos;\
}\
vec2 a = vec2(1.0, 2.0);\
varying float intensity;\
main( 1, 2 );\
\
void main() {\
    vec4 glow = a + b;\
    return glow;\
}"
));
    return;

})();
