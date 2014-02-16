var _string = Parsimmon.string;
var regexNoWs = Parsimmon.regex;
var succeed = Parsimmon.succeed;
var seq = Parsimmon.seq;
var lazy = Parsimmon.lazy;
var optWhitespace = Parsimmon.optWhitespace;

(function() {

var escapeRegex = function( str ) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

var blockComment = regexNoWs( /\/\*.*?\*\//m );
var lineComment = regexNoWs( /\/\/.*/i );

var listToRegex = function( list ) {
    var regex = [];
    for( var x = 0; x < list.length; x++ ) {
        regex.push( escapeRegex( list[x] ) );
    }
    return new RegExp( regex.join('|'), 'i' );
};

var skipAll = regexNoWs( /^\s+/ )
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
    if( typeof r === 'string' ) {
        r = new RegExp( escapeRegex( r ), 'i' );
    }
    return ws( regexNoWs(r) );
};

// http://www.opengl.org/registry/doc/GLSLangSpec.Full.1.20.8.pdf
var

    // User tokens
    FLOAT = regex(/^-?\d+(([.]|e[+-]?)\d+)?/i),
    INT = regex(/^-?\d+/i),
    IDENTIFIER = regex(/^[a-z_][a-z0-9_]*/i),
    TYPE_NAME = regex(/^[a-z_][a-z0-9_]*/i), // ? Can't find this in spec

    // Words defined by the spec
    ATTRIBUTE = regex('ATTRIBUTE'),
    CONST = regex('CONST'),
    BOOL = regex('BOOL'),
    BREAK = regex('BREAK'),
    CONTINUE = regex('CONTINUE'),
    DO = regex('DO'),
    ELSE = regex('ELSE'),
    FOR = regex('FOR'),
    IF = regex('IF'),
    DISCARD = regex('DISCARD'),
    RETURN = regex('RETURN'),
    BVEC2 = regex('BVEC2'),
    BVEC3 = regex('BVEC3'),
    BVEC4 = regex('BVEC4'),
    IVEC2 = regex('IVEC2'),
    IVEC3 = regex('IVEC3'),
    IVEC4 = regex('IVEC4'),
    VEC2 = regex('VEC2'),
    VEC3 = regex('VEC3'),
    VEC4 = regex('VEC4'),
    MAT2 = regex('MAT2'),
    MAT3 = regex('MAT3'),
    MAT4 = regex('MAT4'),
    IN = regex('IN'),
    OUT = regex('OUT'),
    INOUT = regex('INOUT'),
    UNIFORM = regex('UNIFORM'),
    VARYING = regex('VARYING'),
    CENTROID = regex('CENTROID'),
    MAT2X2 = regex('MAT2X2'),
    MAT2X3 = regex('MAT2X3'),
    MAT2X4 = regex('MAT2X4'),
    MAT3X2 = regex('MAT3X2'),
    MAT3X3 = regex('MAT3X3'),
    MAT3X4 = regex('MAT3X4'),
    MAT4X2 = regex('MAT4X2'),
    MAT4X3 = regex('MAT4X3'),
    MAT4X4 = regex('MAT4X4'),
    SAMPLER1D = regex('SAMPLER1D'),
    SAMPLER2D = regex('SAMPLER2D'),
    SAMPLER3D = regex('SAMPLER3D'),
    SAMPLERCUBE = regex('SAMPLERCUBE'),
    SAMPLER1DSHADOW = regex('SAMPLER1DSHADOW'),
    SAMPLER2DSHADOW = regex('SAMPLER2DSHADOW'),
    STRUCT = regex('STRUCT'),
    VOID = regex('VOID'),
    WHILE = regex('WHILE'),
    FLOATCONSTANT = regex('FLOATCONSTANT'),
    INTCONSTANT = regex('INTCONSTANT'),
    BOOLCONSTANT = regex('BOOLCONSTANT'),
    FIELD_SELECTION = regex('FIELD_SELECTION'),
    INVARIANT = regex('INVARIANT'),

    // Operations
    INC_OP = regex('+'),
    DEC_OP = regex('-'),
    LE_OP = regex('<'),
    GE_OP = regex('>'),
    EQ_OP = regex('=='),
    NE_OP = regex('!='),
    AND_OP = regex('&&'),
    OR_OP = regex('||'),
    XOR_OP = regex('^^'),
    LEFT_OP = regex('>>'),
    RIGHT_OP = regex('<<'),

    // Assignments
    LEFT_ASSIGN = regex('<<='),
    RIGHT_ASSIGN = regex('>>='),
    AND_ASSIGN = regex('&='),
    XOR_ASSIGN = regex('^='),
    OR_ASSIGN = regex('|='),
    SUB_ASSIGN = regex('-='),
    MUL_ASSIGN = regex('*='),
    DIV_ASSIGN = regex('/='),
    ADD_ASSIGN = regex('+='),
    MOD_ASSIGN = regex('%='),

    // Symbols
    LEFT_PAREN = regex('('),
    RIGHT_PAREN = regex(')'),
    LEFT_BRACKET = regex('['),
    RIGHT_BRACKET = regex(']'),
    LEFT_BRACE = regex('{'),
    RIGHT_BRACE = regex('}'),
    DOT = regex('.'),
    COMMA = regex(','),
    COLON = regex(':'),
    EQUAL = regex('='),
    SEMICOLON = regex(';'),
    BANG = regex('!'),
    DASH = regex('-'),
    TILDE = regex('~'),
    PLUS = regex('+'),
    STAR = regex('*'),
    SLASH = regex('/'),
    PERCENT = regex('%'),
    LEFT_ANGLE = regex('<'),
    RIGHT_ANGLE = regex('>'),
    VERTICAL_BAR = regex('|'),
    CARET = regex('^'),
    AMPERSAND = regex('&'),
    QUESTION = regex('?');

var variable_identifier = lazy(function() {
    return IDENTIFIER;
});

var primary_expression = lazy(function() {
    return ( variable_identifier )
        .or( INTCONSTANT )
        .or( FLOATCONSTANT )
        .or( BOOLCONSTANT )
        .or( LEFT_PAREN.then(expression).then(RIGHT_PAREN) );
});

/*
i'm trying to de-recurse

var a = ( a.then(b) || c )
a = a b | c    is    c b*

cuz 'a b' can either be 'c b' or '(a b) b', and '(a b) b' can either be 'c b b' or '(a b) b b', and so on ..

var a = a.then( b ) || c
var a = c.then( b.many() )
*/

//var postfix_expression = primary_expression.then(DOT.then(FIELD_SELECTION).many());

//var postfix_expression = lazy(function() {
    //return primary_expression
        //.or( postfix_expression.then(DOT).then(FIELD_SELECTION) );
//});

//var postfix_expression = lazy(function() {
    //return primary_expression.then( DOT.then(FIELD_SELECTION).many() );
//});

// a = b || a.then( c ) || a.then( d )

// b (c | d)*

// a = b || a.then( c ) || a.then( d ) || f || g

// b c
// b d
// f c
// f d
// f
//
// f ( f c )
// f ( f d )
// b ( b c )
// b ( b d )

// ( b || f || g ) ( c || d )*

// b (c | d)*

//d.or( a.then( c ) ).or( a.then( e ).or( f );

//d.then( c.or( e ).many() );

var postfix_expression = lazy(function() {
    return primary_expression.then(
        (
            ( LEFT_BRACKET.then(integer_expression).then(RIGHT_BRACKET) )
                .or( DOT.then(function_call_generic) )
                .or( DOT.then(FIELD_SELECTION) )
                .or( INC_OP )
                .or( DEC_OP )
        ).many()
    );
});

var integer_expression = lazy(function() {
    return expression;
});

var function_call = lazy(function() {
    return function_call_or_method;
});

var function_call_or_method = lazy(function() {
    return function_call_generic
        .or( postfix_expression.then(DOT).then(function_call_generic) );
});

var function_call_generic = lazy(function() {
    return ( function_call_header_with_parameters.then(RIGHT_PAREN) )
        .or( function_call_header_no_parameters.then(RIGHT_PAREN) );
});

var function_call_header_no_parameters = lazy(function() {
    return ( function_call_header.then(VOID) )
        .or( function_call_header );
});

var function_call_header_with_parameters = lazy(function() {
    return ( function_call_header.then(assignment_expression) ).then(
        ( COMMA.then(assignment_expression) ).many()
    );
});

var function_call_header = lazy(function() {
    return function_identifier.then(LEFT_PAREN);
});

var function_identifier = lazy(function() {
    return type_specifier
        .or( IDENTIFIER )
        .or( FIELD_SELECTION );
});

var unary_expression = lazy(function() {
    return ( INC_OP.or( DEC_OP ).or( unary_operator ) ).many().then( postfix_expression );
});

var unary_operator = lazy(function() {
    return PLUS
        .or( DASH )
        .or( BANG )
        .or( TILDE );
});

var multiplicative_expression = lazy(function() {
    return (
        STAR.then(unary_expression)
        .or( SLASH.then(unary_expression) )
        .or( PERCENT.then(unary_expression) )
    ).many().then( unary_expression );
});

var additive_expression = lazy(function() {
    return (
        PLUS.then(multiplicative_expression)
            .or( DASH.then(multiplicative_expression) )
    ).many().then( multiplicative_expression );
});

var shift_expression = lazy(function() {
    return (
        LEFT_OP.then(additive_expression)
            .or( RIGHT_OP.then(additive_expression) )
    ).many().then( additive_expression );
});

var relational_expression = lazy(function() {
    return (
        LEFT_ANGLE.then(shift_expression)
            .or( RIGHT_ANGLE.then(shift_expression) )
            .or( LE_OP.then(shift_expression) )
            .or( GE_OP.then(shift_expression) )
    ).many().then( shift_expression );
});

var equality_expression = lazy(function() {
    return (
        EQ_OP.then(relational_expression)
            .or( NE_OP.then(relational_expression) )
    ).many().then( relational_expression );
});

var and_expression = lazy(function() {
    return ( AMPERSAND.then(equality_expression) ).many().then( equality_expression );
});

var exclusive_or_expression = lazy(function() {
    return ( CARET.then(and_expression) ).many().then( and_expression );
});

var inclusive_or_expression = lazy(function() {
    return ( VERTICAL_BAR.then(exclusive_or_expression) ).many().then( exclusive_or_expression );
});

var logical_and_expression = lazy(function() {
    return ( AND_OP.then(inclusive_or_expression) ).many().then( inclusive_or_expression );
});

var logical_xor_expression = lazy(function() {
    return ( XOR_OP.then(logical_and_expression) ).many().then( logical_and_expression );
});

var logical_or_expression = lazy(function() {
    return ( OR_OP.then(logical_xor_expression) ).many().then( logical_xor_expression );
});

var conditional_expression = lazy(function() {
    return ( logical_or_expression.then(QUESTION).then(expression).then(COLON).then(assignment_expression) )
        .or( logical_or_expression );
});

var assignment_expression = lazy(function() {
    return (
        unary_expression.then(assignment_operator)
    ).many().then( conditional_expression );
});

var assignment_operator = lazy(function() {
    return EQUAL
        .or( MUL_ASSIGN )
        .or( DIV_ASSIGN )
        .or( MOD_ASSIGN )
        .or( ADD_ASSIGN )
        .or( SUB_ASSIGN )
        .or( LEFT_ASSIGN )
        .or( RIGHT_ASSIGN )
        .or( AND_ASSIGN )
        .or( XOR_ASSIGN )
        .or( OR_ASSIGN );
});

var expression = lazy(function() {
    return ( COMMA.then(assignment_expression) ).many().then( assignment_expression );
});

var constant_expression = lazy(function() {
    return conditional_expression;
});

var declaration = lazy(function() {
    return ( function_prototype.then(SEMICOLON) )
        .or( init_declarator_list.then(SEMICOLON) );
});

var function_prototype = lazy(function() {
    return function_declarator.then(RIGHT_PAREN);
});

var function_declarator = lazy(function() {
    return function_header_with_parameters
        .or( function_header );
});

var function_header_with_parameters = lazy(function() {
    return ( function_header.then(parameter_declaration) ).then(
        ( COMMA.then(parameter_declaration) ).many()
    );
});

var function_header = lazy(function() {
    return fully_specified_type.then(IDENTIFIER).then(LEFT_PAREN);
});

var parameter_declarator = lazy(function() {
    return ( type_specifier.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET) )
        .or( type_specifier.then(IDENTIFIER) );
});

var parameter_declaration = lazy(function() {
    return ( type_qualifier.then(parameter_qualifier).then(parameter_declarator) )
        .or( parameter_qualifier.then(parameter_declarator) )
        .or( type_qualifier.then(parameter_qualifier).then(parameter_type_specifier) )
        .or( parameter_qualifier.then(parameter_type_specifier) );
});

var parameter_qualifier = lazy(function() {
    return IN
        .or( OUT )
        .or( INOUT )
        .or( succeed() );
});

var parameter_type_specifier = lazy(function() {
    return type_specifier;
});

var init_declarator_list = lazy(function() {
    return single_declaration.then( (
            ( COMMA.then(IDENTIFIER).then(LEFT_BRACKET).then(RIGHT_BRACKET) )
            .or( COMMA.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression)
                .then( RIGHT_BRACKET ) )
            .or( COMMA.then(IDENTIFIER).then(LEFT_BRACKET)
                .then( RIGHT_BRACKET).then(EQUAL).then(initializer) )
            .or( COMMA.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression)
                .then(RIGHT_BRACKET).then(EQUAL).then(initializer) )
            .or( COMMA.then(IDENTIFIER).then(EQUAL).then(initializer) )
            .or( COMMA.then(IDENTIFIER) )
        ).many() );
});

var single_declaration = lazy(function() {
    return ( fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(RIGHT_BRACKET).then(EQUAL).then(initializer) )
        .or( fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(RIGHT_BRACKET) )
        .or( fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET) )
        .or( fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression) )
        .or( RIGHT_BRACKET.then(EQUAL).then(initializer) )
        .or( fully_specified_type.then(IDENTIFIER).then(EQUAL).then(initializer) )
        .or( INVARIANT.then(IDENTIFIER) )
        .or( fully_specified_type.then(IDENTIFIER) )
        .or( fully_specified_type );
});

var fully_specified_type = lazy(function() {
    return ( type_qualifier.then(type_specifier) )
        .or( type_specifier );
});

var type_qualifier = lazy(function() {
    return CONST
        .or( ATTRIBUTE )
        .or( VARYING )
        .or( CENTROID.then(VARYING) )
        .or( INVARIANT.then(VARYING) )
        .or( INVARIANT.then(CENTROID).then(VARYING) )
        .or( UNIFORM );
});

var type_specifier = lazy(function() {
    return ( type_specifier_nonarray.then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET) )
        .or( type_specifier_nonarray );
});

var type_specifier_nonarray = lazy(function() {
    return VOID
        .or( FLOAT )
        .or( INT )
        .or( BOOL )
        .or( VEC2 )
        .or( VEC3 )
        .or( VEC4 )
        .or( BVEC2 )
        .or( BVEC3 )
        .or( BVEC4 )
        .or( IVEC2 )
        .or( IVEC3 )
        .or( IVEC4 )
        .or( MAT2 )
        .or( MAT3 )
        .or( MAT4 )
        .or( MAT2X2 )
        .or( MAT2X3 )
        .or( MAT2X4 )
        .or( MAT3X2 )
        .or( MAT3X3 )
        .or( MAT3X4 )
        .or( MAT4X2 )
        .or( MAT4X3 )
        .or( MAT4X4 )
        .or( SAMPLER1D )
        .or( SAMPLER2D )
        .or( SAMPLER3D )
        .or( SAMPLERCUBE )
        .or( SAMPLER1DSHADOW )
        .or( SAMPLER2DSHADOW )
        .or( struct_specifier )
        .or( TYPE_NAME );
});

var struct_specifier = lazy(function() {
    return ( STRUCT.then(IDENTIFIER).then(LEFT_BRACE).then(struct_declaration_list).then(RIGHT_BRACE) )
        .or( STRUCT.then(LEFT_BRACE).then(struct_declaration_list).then(RIGHT_BRACE) );
});

var struct_declaration_list = lazy(function() {
    return struct_declaration.then(
        struct_declaration.many()
    );
});

var struct_declaration = lazy(function() {
    return ( type_specifier.then(struct_declarator_list).then(SEMICOLON) );
});

var struct_declarator_list = lazy(function() {
    return struct_declarator.then(
        ( COMMA.then(struct_declarator) ).many()
    );
});

var struct_declarator = lazy(function() {
    return ( IDENTIFIER.then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET) )
        .or( IDENTIFIER );
});

var initializer = lazy(function() {
    return assignment_expression;
});

var declaration_statement = lazy(function() {
    return declaration;
});

var statement = lazy(function() {
    return compound_statement
        .or( simple_statement );
});

var simple_statement = lazy(function() {
    return declaration_statement
        .or( expression_statement )
        .or( selection_statement )
        .or( iteration_statement )
        .or( jump_statement );
});

var compound_statement = lazy(function() {
    return ( LEFT_BRACE.then(RIGHT_BRACE) )
        .or( LEFT_BRACE.then(statement_list).then(RIGHT_BRACE) );
});

var statement_no_new_scope = lazy(function() {
    return ( compound_statement_no_new_scope )
        .or( simple_statement );
});

var compound_statement_no_new_scope = lazy(function() {
    return ( LEFT_BRACE.then(RIGHT_BRACE) )
        .or( LEFT_BRACE.then(statement_list).then(RIGHT_BRACE) );
});

var statement_list = lazy(function() {
    return statement.many();
});

var expression_statement = lazy(function() {
    return ( expression.then(SEMICOLON) )
        .or( SEMICOLON );
});

var selection_statement = lazy(function() {
    return ( IF.then(LEFT_PAREN).then(expression).then(RIGHT_PAREN).then(selection_rest_statement) );
});

var selection_rest_statement = lazy(function() {
    return ( statement.then(ELSE).then(statement) )
        .or( statement );
});

var condition = lazy(function() {
    return ( fully_specified_type.then(IDENTIFIER).then(EQUAL).then(initializer) )
        .or( expression );
});

// I modified the last line of this because it was looping through
// statement_no_new_scope > simple_statement forever
//var iteration_statement = lazy(function() {
    //return ( WHILE.then(LEFT_PAREN).then(condition).then(RIGHT_PAREN).then(statement_no_new_scope) )
        //.or( DO.then(statement).then(WHILE).then(LEFT_PAREN).then(expression).then(RIGHT_PAREN).then(SEMICOLON) )
        //.or( FOR.then(LEFT_PAREN).then(for_init_statement).then(for_rest_statement).then(RIGHT_PAREN) )
        //.or( statement_no_new_scope );
//});

var iteration_statement = lazy(function() {
    return ( WHILE.then(LEFT_PAREN).then(condition).then(RIGHT_PAREN).then(statement_no_new_scope) )
        .or( DO.then(statement).then(WHILE).then(LEFT_PAREN).then(expression).then(RIGHT_PAREN).then(SEMICOLON) )
        .or( FOR.then(LEFT_PAREN).then(for_init_statement).then(for_rest_statement).then(RIGHT_PAREN).then( statement_no_new_scope ) );
});

var for_init_statement = lazy(function() {
    return ( expression_statement )
        .or( declaration_statement );
});

var conditionopt = lazy(function() {
    return condition
        .or( succeed() );
});

var for_rest_statement = lazy(function() {
    return ( conditionopt.then(SEMICOLON).then(expression) )
        .or( conditionopt.then(SEMICOLON) );
});

var jump_statement = lazy(function() {
    return ( CONTINUE.then(SEMICOLON) )
        .or( BREAK.then(SEMICOLON) )
        .or( RETURN.then(SEMICOLON) )
        .or( RETURN.then(expression).then(SEMICOLON) )
        .or( DISCARD.then(SEMICOLON) );
});

var translation_unit = lazy(function() {
    return external_declaration.then(
        external_declaration.many()
    );
});

var external_declaration = lazy(function() {
    return ( function_definition )
        .or( declaration );
});

var function_definition = lazy(function() {
    return ( function_prototype.then(compound_statement_no_new_scope) );
});

var p = statement_list;

console.log(  statement_list.parse("\
struct light {\
    float intensity;\
    vec3 position;\
} lightVar;\
mat3(float, float, float,\n\
 float, float, float,\n\
 float, float, float);\n\
mat2(float);\
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
 "));

}());
