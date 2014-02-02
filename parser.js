var _string = Parsimmon.string;
var _regex = Parsimmon.regex;
var succeed = Parsimmon.succeed;
var seq = Parsimmon.seq;
var lazy = Parsimmon.lazy;
var optWhitespace = Parsimmon.optWhitespace;

var prefixes = ['precision'];
var precisions = ['lowp', 'mediump', 'highp'];
var keywords = ['uniform', 'varying', 'const', 'mediump', 'lowp', 'highp'];
var types = ['int', 'float', 'vec2', 'vec3', 'vec4', 'mat4', 'sampler2D', 'samplerCube', 'ivec3', 'mat4'];
var infixes = [ '*', '+', '<<', '>>', '<', '>', '<=', '>=', '==', '!=', '&', '^', '|', '&&', '||' ];

var assignmentInfix = [ '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '^=', '|=' ];

var fnTypes = ['void'].concat( types );

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

    var escapes = {
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    };

    //var array = seq([regex(/^\[\s*/m), commaSep(json), string(']')]).map(function(results) {
        //return results[1];
    //});

    //var pair = seq([stringLiteral.skip(regex(/^\s*:\s*/m)), json]);

    //var object = seq([regex(/^[{]\s*/m), commaSep(pair), string('}')]).map(function(results) {
        //var pairs = results[1];
        //var out = {};
        //for (var i = pairs.length-1; i >= 0; i -= 1) {
        //out[pairs[i][0]] = pairs[i][1];
        //}
        //return out;
    //});

//var types = ['int' ,'float' ,'vec2' ,'vec3' ,'vec4' ,'vec3' ,'mat4' ,'sampler2D' ,'samplerCube' ,'int' ,'ivec3' ,'float' ,'vec3' ,'vec2' ,'vec3' ,'vec4' ,'mat4' ,'sampler2D'];
    //
    //var nullLiteral = string('null').result(null);
    //var trueLiteral = string('true').result(true);
    //var falseLiteral = string('false').result(false);

    // todo: better way to not include semicolon?
    var statement = lazy(function() {
        return seq([
            assignment
                .or(functionDecleration)
                .or(invocation)
                .or(decleration)
                .or(expression)
                .skip( string(';').or( Parsimmon.eof ) )
        ]);
    });

    var expression = lazy(function() {
        return integer
            .or( infixed )
            .or( number )
            .or( invocation )
            .or( varName )
            .or( grouped );
    });

    //
    // Language agnostic helper functions
    //
    var between = function( left, right, parser ) {
        return left.then( parser ).skip( right );
    };

    var parenthed = function( parser ) {
        return between(string('('), string(')'), parser);
    };

    var commaSep = function(parser) {
        var commaParser = ws( string( ',') ).then(parser).many();
        return seq([parser, commaParser]).map(function(results) {
            return [results[0]].concat(results[1]);
        }).or(succeed([]));
    };

    // Ignore whitespace
    var ws = function( f ) {
        return Parsimmon.optWhitespace.then( f );
    };

    // Can this be done better?
    var string = function(s) {
        return ws( _string(s) );
    };
    var regex = function(r) {
        if( r instanceof Array ) {
            r = listToRegex( r );
        }
        return ws( _regex(r) );
    };

    //
    // Terminators
    //

    var integer = regex(/^\d+/i).map(parseInt);
    var number = regex(/^\d+(([.]|e[+-]?)\d+)?/i).map(parseFloat);
    var stringLiteral = regex(/^"(\\.|.)*?"/).map(function(str) {
        return str.slice(1, -1);
    });

    var varName = regex(/^[a-z_][a-z0-9_]*/i).map(function(str) {
        // todo: reserved words, scope test
        return str;
    });

    //
    // Constructs
    //

    var infix = regex( infixes );
    var type = regex( types );
    var preVarWords = regex( [].concat( prefixes, precisions, keywords ) );

    // [mediump uniform] float num
    var decleration = seq([
        preVarWords.many(), type, varName
    ]);
    
    // float num = expression
    var assignment = seq([
        decleration,
        regex( assignmentInfix ),
        expression
    ]);

    var commaList = string('(').then(function() {
        return expression.commaStuff().skip(string(')'));
    });

    var args = string('(').then(function() {
        return commaSep( varName ).skip(string(')'));
    });

    var block = between( string( '{' ), string( '}' ), statement.many() );

    var functionDecleration = seq([
        regex( fnTypes ),
        varName,
        args,
        block
    ]);

    var invocation = seq([
        varName.or( type ),
        parenthed( commaSep( expression ) )
    ]);

    var grouped = parenthed( expression );

    var infixed = seq([ varName, infix, varName ]);

    return lazy(function() {
        return statement.many();
    });

})();

var str1 = "\
uniform int a;\n\
uniform vec3 viewVector = 1;\n\
uniform float c = 1;\n\
uniform float p = 1;\n\
varying float intensity;\
\
void main() {\
    vec4 glow = a + b;\
}";

var str2 = "a + b;";
var result = json.parse( str2 );
/*
    vec3 vNormal = normalize( normalMatrix * normal );\
    vec3 vNormel = normalize( normalMatrix * viewVector );\
    intensity = pow( c - dot(vNormal, vNormel), p );\
    \
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
}

*/

console.log(result);
