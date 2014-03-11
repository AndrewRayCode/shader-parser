/* global skipAll:true */
/* global _regex:true */
/* global blockComment:true */
/* global lineComment:true */
var blockComment = regex( /\/\*.*?\*\//m );
var lineComment = regex( /\/\/.*/i );

var skipAll = regex( /^\s+/ )
    .or( blockComment )
    .or( lineComment )
    .many();

var escapeRegex = function( str ) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

var _regex = function( re ) {
    if( typeof re === 'string' ) {
        re = new RegExp( escapeRegex( re ), 'i' );
    }
    return skipAll.then( regex( re ) ).skip( skipAll ).map(function() {
        //console.log( '    matched: ',arguments );
        return arguments;
    });
};

/*
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

var postfix_expression = lazy(function() {
    return ( primary_expression )
        .or( postfix_expression.then(LEFT_BRACKET).then(integer_expression).then(RIGHT_BRACKET) )
        .or( function_call )
        .or( postfix_expression.then(DOT).then(FIELD_SELECTION) )
        .or( postfix_expression.then(INC_OP) )
        .or( postfix_expression.then(DEC_OP) );
});

var integer_expression = lazy(function() {
    return expression;
});

var function_call = lazy(function() {
    return function_call_or_method;
});

var function_call_or_method = lazy(function() {
    return ( function_call_generic )
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
    return ( function_call_header.then(assignment_expression) )
        .or( function_call_header_with_parameters.then(COMMA).then(assignment_expression) );
});

var function_call_header = lazy(function() {
    return function_identifier.then( LEFT_PAREN );
});

var function_identifier = lazy(function() {
    return ( type_specifier )
        .or( IDENTIFIER )
        .or( FIELD_SELECTION );
});

var unary_expression = lazy(function() {
    return ( postfix_expression )
        .or( INC_OP.then(unary_expression) )
        .or( DEC_OP.then(unary_expression) )
        .or( unary_operator.then(unary_expression) );
});

var unary_operator = lazy(function() {
    return ( PLUS )
        .or( DASH )
        .or( BANG )
        .or( TILDE );
});

var multiplicative_expression = lazy(function() {
    return ( unary_expression )
        .or( multiplicative_expression.then(STAR).then(unary_expression) )
        .or( multiplicative_expression.then(SLASH).then(unary_expression) )
        .or( multiplicative_expression.then(PERCENT).then(unary_expression) );
});

var additive_expression = lazy(function() {
    return ( multiplicative_expression )
        .or( additive_expression.then(PLUS).then(multiplicative_expression) )
        .or( additive_expression.then(DASH).then(multiplicative_expression) );
});

var shift_expression = lazy(function() {
    return ( additive_expression )
        .or( shift_expression.then(LEFT_OP).then(additive_expression) )
        .or( shift_expression.then(RIGHT_OP).then(additive_expression) );
});

var relational_expression = lazy(function() {
    return ( shift_expression )
        .or( relational_expression.then(LEFT_ANGLE).then(shift_expression) )
        .or( relational_expression.then(RIGHT_ANGLE).then(shift_expression) )
        .or( relational_expression.then(LE_OP).then(shift_expression) )
        .or( relational_expression.then(GE_OP).then(shift_expression) );
});

var equality_expression = lazy(function() {
    return ( relational_expression )
        .or( equality_expression.then(EQ_OP).then(relational_expression) )
        .or( equality_expression.then(NE_OP).then(relational_expression) );
});

var and_expression = lazy(function() {
    return ( equality_expression )
        .or( and_expression.then(AMPERSAND).then(equality_expression) );
});

var exclusive_or_expression = lazy(function() {
    return ( and_expression )
        .or( exclusive_or_expression.then(CARET).then(and_expression) );
});

var inclusive_or_expression = lazy(function() {
    return ( exclusive_or_expression )
        .or( inclusive_or_expression.then(VERTICAL_BAR).then(exclusive_or_expression) );
});

var logical_and_expression = lazy(function() {
    return ( inclusive_or_expression )
        .or( logical_and_expression.then(AND_OP).then(inclusive_or_expression) );
});

var logical_xor_expression = lazy(function() {
    return ( logical_and_expression )
        .or( logical_xor_expression.then(XOR_OP).then(logical_and_expression) );
});

var logical_or_expression = lazy(function() {
    return ( logical_xor_expression )
        .or( logical_or_expression.then(OR_OP).then(logical_xor_expression) );
});

var conditional_expression = lazy(function() {
    return ( logical_or_expression )
        .or( logical_or_expression.then(QUESTION).then(expression).then(COLON).then(assignment_expression) );
});

var assignment_expression = lazy(function() {
    return ( conditional_expression )
        .or( unary_expression.then(assignment_operator).then(assignment_expression) );
});

var assignment_operator = lazy(function() {
    return ( EQUAL )
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
    return ( assignment_expression )
        .or( expression.then(COMMA).then(assignment_expression) );
});

var constant_expression = lazy(function() {
    return conditional_expression;
});

var declaration = lazy(function() {
    //return init_declarator_list.then(SEMICOLON);
    return ( function_prototype.then(SEMICOLON) )
        .or( init_declarator_list.then(SEMICOLON) );
});

var function_prototype = lazy(function() {
    return ( function_declarator ).then( RIGHT_PAREN );
});

var function_declarator = lazy(function() {
    return ( function_header )
        .or( function_header_with_parameters );
});

var function_header_with_parameters = lazy(function() {
    return ( function_header.then(parameter_declaration) )
        .or( function_header_with_parameters.then(COMMA).then(parameter_declaration) );
});

var function_header = lazy(function() {
    return ( fully_specified_type ).then(IDENTIFIER).then(LEFT_PAREN);
});

var parameter_declarator = lazy(function() {
    return ( type_specifier.then(IDENTIFIER) )
        .or( type_specifier.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET) );
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
        .or( INOUT );
});

var parameter_type_specifier = lazy(function() {
    return type_specifier;
});

var init_declarator_list = lazy(function() {
    //return single_declaration;
    return ( single_declaration )
        .or( init_declarator_list.then(COMMA).then(IDENTIFIER) )
        .or( init_declarator_list.then(COMMA).then(IDENTIFIER).then(LEFT_BRACKET).then(RIGHT_BRACKET) )
        .or( init_declarator_list.then(COMMA).then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression) )
        .or( RIGHT_BRACKET )
        .or( init_declarator_list.then(COMMA).then(IDENTIFIER).then(LEFT_BRACKET) )
        .or( RIGHT_BRACKET.then(EQUAL).then(initializer) )
        .or( init_declarator_list.then(COMMA).then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression) )
        .or( RIGHT_BRACKET.then(EQUAL).then(initializer) )
        .or( init_declarator_list.then(COMMA).then(IDENTIFIER).then(EQUAL).then(initializer) );
});

var single_declaration = lazy(function() {
    //return fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET);
    return ( fully_specified_type )
        .or( fully_specified_type.then(IDENTIFIER) )
        .or( fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(RIGHT_BRACKET) )
        .or( fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET) )
        .or( fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(RIGHT_BRACKET).then(EQUAL).then(initializer) )
        .or( fully_specified_type.then(IDENTIFIER).then(LEFT_BRACKET).then(constant_expression) )
        .or( RIGHT_BRACKET.then(EQUAL).then(initializer) )
        .or( fully_specified_type.then(IDENTIFIER).then(EQUAL).then(initializer) )
        .or( INVARIANT.then(IDENTIFIER) );
});

var fully_specified_type = lazy(function() {
    //return type_specifier;
    return ( type_specifier )
        .or( type_qualifier.then(type_specifier) );
});

var type_qualifier = lazy(function() {
    return ( CONST )
        .or( ATTRIBUTE )
        .or( VARYING )
        .or( CENTROID.then(VARYING) )
        .or( INVARIANT.then(VARYING) )
        .or( INVARIANT.then(CENTROID).then(VARYING) )
        .or( UNIFORM );
});

var type_specifier = lazy(function() {
    return ( type_specifier_nonarray )
        .or( type_specifier_nonarray.then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET) );
});

var type_specifier_nonarray = lazy(function() {
    return ( VOID )
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
    return ( struct_declaration )
        .or( struct_declaration_list.then(struct_declaration) );
});

var struct_declaration = lazy(function() {
    return ( type_specifier.then(struct_declarator_list).then(SEMICOLON) );
});

var struct_declarator_list = lazy(function() {
    return ( struct_declarator )
        .or( struct_declarator_list.then(COMMA).then(struct_declarator) );
});

var struct_declarator = lazy(function() {
    return ( IDENTIFIER )
        .or( IDENTIFIER.then(LEFT_BRACKET).then(constant_expression).then(RIGHT_BRACKET) );
});

var initializer = lazy(function() {
    return assignment_expression;
});

var declaration_statement = lazy(function() {
    return declaration;
});

var statement = lazy(function() {
    //return simple_statement;
    return ( compound_statement )
        .or( simple_statement );
});

var simple_statement = lazy(function() {
    return ( declaration_statement )
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
    return ( statement )
        .or( statement_list.then(statement) );
});

var expression_statement = lazy(function() {
    return ( SEMICOLON )
        .or( expression.then(SEMICOLON) );
});

var selection_statement = lazy(function() {
    return IF.then(LEFT_PAREN).then(expression).then(RIGHT_PAREN).then(selection_rest_statement);
});

var selection_rest_statement = lazy(function() {
    return ( statement.then(ELSE).then(statement) )
        .or( statement );
});

var condition = lazy(function() {
    return ( expression )
        .or( fully_specified_type.then(IDENTIFIER).then(EQUAL).then(initializer) );
});

var iteration_statement = lazy(function() {
    return ( WHILE.then(LEFT_PAREN).then(condition).then(RIGHT_PAREN).then(statement_no_new_scope) )
        .or( DO.then(statement).then(WHILE).then(LEFT_PAREN).then(expression).then(RIGHT_PAREN).then(SEMICOLON) )
        .or( FOR.then(LEFT_PAREN).then(for_init_statement).then(for_rest_statement).then(RIGHT_PAREN).then(statement_no_new_scope) );
});

var for_init_statement = lazy(function() {
    return ( expression_statement )
        .or( declaration_statement );
});

var conditionopt = lazy(function() {
    return condition.many();
});

var for_rest_statement = lazy(function() {
    return ( conditionopt.then(SEMICOLON) )
        .or( conditionopt.then(SEMICOLON).then(expression) );
});

var jump_statement = lazy(function() {
    return ( CONTINUE.then(SEMICOLON) )
        .or( BREAK.then(SEMICOLON) )
        .or( RETURN.then(SEMICOLON) )
        .or( RETURN.then(expression).then(SEMICOLON) )
        .or( DISCARD.then(SEMICOLON) );
});

var translation_unit = lazy(function() {
    return ( external_declaration )
        .or( translation_unit.then(external_declaration) );
});

var external_declaration = lazy(function() {
    //return declaration;
    return ( function_definition )
        .or( declaration );
});

var function_definition = lazy(function() {
    return function_prototype.then(compound_statement_no_new_scope);
});
*/

//console.log( statement_list.parse('void mains() {}') );
//mat3( 1.0 );\
//struct light {\
    //float intensity; // meow\n\
    //vec3 position;\
//} lightVar;\
//mat3 m = mat3( 1.1, 2.1, 3.1, // first column (not row!)\n\
   //1.2, 2.2, 3.2, // second column\n\
   //1.3, 2.3, 3.3 );  // third column\n\
//mat3( 1.0, \
   //1.2, 2.2, 3.2,\
   //1.3, 2.3, 3.3 );\
    //vec4 glow = a + b;\
    //return glow;\
 //'));

