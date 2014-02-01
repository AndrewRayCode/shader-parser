var string = Parsimmon.string;
var regex = Parsimmon.regex;
var succeed = Parsimmon.succeed;
var seq = Parsimmon.seq;
var lazy = Parsimmon.lazy;
var optWhitespace = Parsimmon.optWhitespace;

var keywords = ['uniform', 'varying', 'const'];
var types = ['int', 'float', 'vec2', 'vec3', 'vec4', 'mat4', 'sampler2D', 'samplerCube', 'ivec3', 'mat4'];

var fnTypes = ['void'].concat( types );

var json = (function() {

    var json = lazy(function() {
        return stmtWithFunction.many();
        //return object
            //.or(stmt)
            //.or(array)
            //.or(stringLiteral)
            //.or(numberLiteral)
            //.or(nullLiteral)
            //.or(trueLiteral)
            //.or(falseLiteral)
            //.skip(regex(/^\s*/m));
    });

    var escapes = {
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    };

    var stringLiteral = regex(/^"(\\.|.)*?"/).map(function(str) {
        return str.slice(1, -1).replace(/\\u(\d{4})/, function(_, hex) {
        return String.fromCharCode(parseInt(hex, 16));
        }).replace(/\\(.)/, function(_, ch) {
        return escapes.hasOwnProperty(ch) ? escapes[ch] : ch;
        });
    });

    var integerLiteral = regex(/^\d+/i).map(parseInt);

    var varName = regex(/^[a-z_][a-z0-9_]*/i).map(function(str) {
        // todo: reserved words, scope test
        return str;
    }).skip(optWhitespace);

    var numberLiteral = regex(/^\d+(([.]|e[+-]?)\d+)?/i).map(parseFloat);

    function commaSep(parser) {
        var commaParser = regex(/^,\s*/m).then(parser).many();
        return seq([parser, commaParser]).map(function(results) {
            return [results[0]].concat(results[1]);
        }).or(succeed([]));
    }

    var array = seq([regex(/^\[\s*/m), commaSep(json), string(']')]).map(function(results) {
        return results[1];
    });

    var pair = seq([stringLiteral.skip(regex(/^\s*:\s*/m)), json]);

    var object = seq([regex(/^[{]\s*/m), commaSep(pair), string('}')]).map(function(results) {
        var pairs = results[1];
        var out = {};
        for (var i = pairs.length-1; i >= 0; i -= 1) {
        out[pairs[i][0]] = pairs[i][1];
        }
        return out;
    });

//var types = ['int' ,'float' ,'vec2' ,'vec3' ,'vec4' ,'vec3' ,'mat4' ,'sampler2D' ,'samplerCube' ,'int' ,'ivec3' ,'float' ,'vec3' ,'vec2' ,'vec3' ,'vec4' ,'mat4' ,'sampler2D'];
    //
    var nullLiteral = string('null').result(null);
    var trueLiteral = string('true').result(true);
    var falseLiteral = string('false').result(false);

    var expression = integerLiteral;

    var type = regex(new RegExp('^' + types.join('|')));

    // float num
    var decleration = seq([
        type.skip(optWhitespace), varName
    ]);
    
    // float num = expression
    var assignment = seq([
        decleration,
        string('=').skip(optWhitespace),
        expression
    ]);

    // float num[ = expression]
    var varStatement = assignment.or( decleration );

    // uniform float num[ = expression]
    var headVarStatement = seq([
        regex(new RegExp(keywords.join('|'))).skip(optWhitespace),
        varStatement
    ]);

    var statementBody =
        assignment
        .or(decleration)
        .or(varStatement)
        .or(headVarStatement)
        .or(expression);

    // todo: better way to not include semicolon?
    var stmt = seq([ statementBody.skip(regex(/\s*;\s*/m)) ]);

    var args = string('(').skip(optWhitespace).then(function() {
        return commaSep( varName ).skip(string(')'));
    });

    var block = seq([
        regex(/^[{]\s*/m),
        stmt.many().or(succeed([])),
        string('}')
    ]).map(function(results) {
        return results[1];
    });

    var fn = seq([
        regex(new RegExp(fnTypes.join('|'))).skip(optWhitespace),
        varName.skip(optWhitespace),
        args.skip(optWhitespace),
        block
    ]);

    var stmtWithFunction = stmt.or(fn);

    return json;
})();

var str1 = "\
uniform int a;\n\
uniform vec3 viewVector = 1;\n\
uniform float c = 1;\n\
uniform float p = 1;\n\
varying float intensity;\
\
void main() {\
    vec3 q = 1;\
}";

var str2 = "vec3 q = 1;";
var result = json.parse( str1 );
/*
    vec3 vNormal = normalize( normalMatrix * normal );\
    vec3 vNormel = normalize( normalMatrix * viewVector );\
    intensity = pow( c - dot(vNormal, vNormel), p );\
    \
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
}

*/

console.log(result);
