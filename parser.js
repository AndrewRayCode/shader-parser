var _string = Parsimmon.string;
var regexNoWs = Parsimmon.regex;
var succeed = Parsimmon.succeed;
var seq = Parsimmon.seq;
var lazy = Parsimmon.lazy;
var optWhitespace = Parsimmon.optWhitespace;

var prefixes = ['precision'];
var precisions = ['lowp', 'mediump', 'highp'];
var keywords = ['uniform', 'varying', 'const', 'mediump', 'lowp', 'highp'];
var types = [ 'void', 'bool', 'int', 'float', 'vec2', 'vec3', 'vec4', 'bvec2', 'bvec3', 'bvec4', 'ivec2', 'ivec3', 'ivec4', 'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4', 'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler1DShadow', 'sampler2DShadow' ];

var infixOperators = [ '*', '+', '<<', '>>', '<', '>', '<=', '>=', '==', '!=', '&', '^', '|', '&&', '||' ];

var assignmentInfix = [ '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '^=', '|=' ];

var json = (function() {

    var escapeRegex = function( str ) {
        return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    };

    var emptyArrToNull = function( arr ) {
        return !(arr && arr.length) ? null : arr;
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

    var squared = function( parser ) {
        return between(string('['), string(']'), parser);
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
    var lineComment = regexNoWs( /^\/\/.*/i );

    var skipAll = regexNoWs( /\s+/ )
        .or( blockComment )
        .or( lineComment )
        .many();

    // Ignore whitespace
    var ws = function( f ) {
        return skipAll.then( f ).skip( skipAll );
    };

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
    var identifier = regex(/^[a-z_][a-z0-9_]*/i);

    var atom = lazy(function() {
        return number
            .or( integer )
            .or( stringLiteral )
            .or( arrayIndex )
            .or( identifier );
    });

    var infix = function( term, operators ) {
        return chainr1( term, regex( operators ).map(function( operator ) {
            return function( left, right ) {
                return {
                    nodeType: operator,
                    left: left,
                    right: right
                };
            };
        }));
    };

    var invocation = lazy(function() {
        return identifier.then(function( name ) {
            return parenthed( commaSep( expression ) ).map(function( args ) {
                return {
                    nodeType: 'invocation',
                    name: name,
                    first: args
                };
            });
        });
    });

    var rightFix = function( operator, left ) {
        return left.skip( string( operator ) ).map(function( name ) {
            return {
                nodeType: operator,
                left: name
            };
        });
    };

    var leftFix = function( operator, right ) {
        return string( operator ).then( right ).map(function( name ) {
            return {
                nodeType: operator,
                left: name
            };
        });
    };

    var pp = rightFix( '++', identifier );
    var mm = rightFix( '--', identifier );
    var ppl = leftFix( '++', identifier );
    var mml = leftFix( '--', identifier );

    var arrayIndex = lazy(function() {
        return identifier.then( function( name ) {
            return squared( optional( expression ) ).map( function( index ) {
                return {
                    nodeType: 'arrayIndex',
                    name: name,
                    index: index
                };
            });
        });
    });

    // const float d[3] = float[](5.0, 7.2, 1.1);
    var arrayInstantation = arrayIndex.then(function( index ) {
        return parenthed( commaSep( expression ) ).map(function( args ) {
            return {
                nodeType: 'arrayInstantation',
                index: index,
                args: args
            };
        });
    });

    var expressionBase = lazy(function() {
        return invocation
            .or( arrayIndex )
            .or( pp )
            .or( mm )
            .or( ppl )
            .or( mml )
            .or( atom )
            .or( parenthed( expression ))
            .or( squared( expression ));
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
        identifier
    ]).then(function( leftTypes ) {
        return commaSep( arrayIndex.or( identifier ) ).map(function( name ) {
            var dec = {
                nodeType: 'decleration',
                declerations: emptyArrToNull( _.compact( leftTypes.slice( 0, -1 ) ) ),
                type: leftTypes[ 3 ],
            };

            dec['name' + ( name instanceof Array ? 's' : '' )] = name;
            return dec;
        });
    });

    var assignment = typeDec.then(function( dec ) {
        return regex( assignmentInfix ).then( function() {
            return arrayInstantation.or( expression ).map(function( op ) {
                return {
                    nodeType: 'assignment',
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
        return parenthed( commaSep( identifier ) );
    });

    var returnStatement = string('return').then(function() {
        return expression;
    }).skip( string(';').or( Parsimmon.eof ));

    var functionDecleration = seq([
        identifier,
        identifier,
        functionArgs
    ]).then(function( parts ) {
        return nippled( ( returnStatement.or( statement ) ).many() ).map(function( results ) {
            return {
                nodeType: 'function',
                returnType: parts[0],
                name: parts[1],
                args: parts[2],
                body: results
            };
        });
    });

    var blockStatement = function( keyword, condition ) {
        return string( keyword ).then( parenthed( condition ) ).then( function( condRes ) {
            return nippled( statement.many() ).or( statement ).map( function( body ) {
                return {
                    nodeType: 'for',
                    first: condRes[0],
                    second: condRes[2],
                    third: condRes[3],
                    body: body
                };
            });
        });
    };

    var forStatement = blockStatement( 'for', seq([
        assignment, string(';'), expression, string(';'), expression
    ]));

    var whileStatement = blockStatement( 'while', expression );

    var struct = string( 'struct' ).then( identifier ).then( function( name ) {
        return nippled( typeDec.skip( string(';') ).many() ).then(function( body ) {
            return identifier.many().map( function( declared ) {
                return {
                    type: 'struct',
                    name: name,
                    body: body,
                    declared: emptyArrToNull( declared )
                };
            });
        });
    });

    var constructor = regex( types ).then( function( name ) {
        return functionArgs.map(function( args ) {
            return {
                nodeType: 'constructor',
                type: name,
                args: args
            };
        });
    });

    var statement = (
            forStatement
            .or( struct )
            .or( whileStatement )
            .or( functionDecleration )
            .or( assignment )
            .or( constructor )
            .or( invocation )
            .or( typeDec )
            .or( expression )
            .map(function(a) {
                console.log(a);
                return a;
            })
        // include statements that don't end in ; like for {}
        ).skip( string(';').or( Parsimmon.optWhitespace ).or( Parsimmon.eof ));

    var p = statement.many();

    console.log(p.parse("\
const float c[3] = float[3](5.0, 7.2, 1.1);\
struct light {\
    float intensity;\
    vec3 position;\
} lightVar;\
mat3(float, float, boat, // inline comment\n\
 float, float, float,\n\
 float, float, float);\n\
mat2(float)\
\
void main() {\
    vec4 glow = a + b;\
    return glow;\
}\
mat2(vec2, vec2);\
float a, b;\
float a, b = 1.5;\
struct light {\
    float intensity;\
    vec3 position;\
};\
mat3 /* pewp pewp */ m3x3 = mat3(m2x2);\
uniform vec3 viewVector = 1;\n\
light lightVar = light(3.0, vec3(1.0, 2.0, 3.0));\
uniform float c = 1;\n\
uniform float p = 1;\n\
for(int i=0;i<int(uLightCount);++i) {\
    vec3 lightPos;\
}\
vec2 a = vec2(1.0, 2.0);\
varying float intensity;\
main( 1, 2 );\
 ")[0]);
    return;

})();
