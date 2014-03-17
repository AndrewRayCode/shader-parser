var variable_identifier = lazy(function() {
    return IDENTIFIER;
});

var primary_expression = lazy(function() {
    return variable_identifier
        .or( INTCONSTANT )
        .or( UINTCONSTANT )
        .or( FLOATCONSTANT )
        .or( BOOLCONSTANT )
        .or( DOUBLECONSTANT )
        .or( LEFT_PAREN.then( expression ).then( RIGHT_PAREN ) );
});

var postfix_expression = lazy(function() {
    return primary_expression
        .or( postfix_expression.then( LEFT_BRACKET ).then( integer_expression ).then( RIGHT_BRACKET ) )
        .or( function_call )
        .or( postfix_expression.then( DOT ).then( FIELD_SELECTION ) )
        .or( postfix_expression.then( INC_OP ) )
        .or( postfix_expression.then( DEC_OP ) );
});

var integer_expression = lazy(function() {
    return expression;
});

var function_call = lazy(function() {
    return function_call_or_method;
});

var function_call_or_method = lazy(function() {
    return function_call_generic;
});

var function_call_generic = lazy(function() {
    return ( function_call_header_with_parameters.then( RIGHT_PAREN ) )
        .or( function_call_header_no_parameters.then( RIGHT_PAREN ) );
});

var function_call_header_no_parameters = lazy(function() {
    return ( function_call_header.then( VOID ) )
        .or( function_call_header );
});

var function_call_header_with_parameters = lazy(function() {
    return ( function_call_header.then( assignment_expression ) )
        .or( function_call_header_with_parameters.then( COMMA ).then( assignment_expression ) );
});

var function_call_header = lazy(function() {
    return ( function_identifier.then( LEFT_PAREN ) );
});

var function_identifier = lazy(function() {
    return type_specifier
        .or( postfix_expression );
});

var unary_expression = lazy(function() {
    return postfix_expression
        .or( INC_OP.then( unary_expression ) )
        .or( DEC_OP.then( unary_expression ) )
        .or( unary_operator.then( unary_expression ) );
});

var unary_operator = lazy(function() {
    return PLUS
        .or( DASH )
        .or( BANG )
        .or( TILDE );
});

var multiplicative_expression = lazy(function() {
    return unary_expression
        .or( multiplicative_expression.then( STAR ).then( unary_expression ) )
        .or( multiplicative_expression.then( SLASH ).then( unary_expression ) )
        .or( multiplicative_expression.then( PERCENT ).then( unary_expression ) );
});

var additive_expression = lazy(function() {
    return multiplicative_expression
        .or( additive_expression.then( PLUS ).then( multiplicative_expression ) )
        .or( additive_expression.then( DASH ).then( multiplicative_expression ) );
});

var shift_expression = lazy(function() {
    return additive_expression
        .or( shift_expression.then( LEFT_OP ).then( additive_expression ) )
        .or( shift_expression.then( RIGHT_OP ).then( additive_expression ) );
});

var relational_expression = lazy(function() {
    return shift_expression
        .or( relational_expression.then( LEFT_ANGLE ).then( shift_expression ) )
        .or( relational_expression.then( RIGHT_ANGLE ).then( shift_expression ) )
        .or( relational_expression.then( LE_OP ).then( shift_expression ) )
        .or( relational_expression.then( GE_OP ).then( shift_expression ) );
});

var equality_expression = lazy(function() {
    return relational_expression
        .or( equality_expression.then( EQ_OP ).then( relational_expression ) )
        .or( equality_expression.then( NE_OP ).then( relational_expression ) );
});

var and_expression = lazy(function() {
    return equality_expression
        .or( and_expression.then( AMPERSAND ).then( equality_expression ) );
});

var exclusive_or_expression = lazy(function() {
    return and_expression
        .or( exclusive_or_expression.then( CARET ).then( and_expression ) );
});

var inclusive_or_expression = lazy(function() {
    return exclusive_or_expression
        .or( inclusive_or_expression.then( VERTICAL_BAR ).then( exclusive_or_expression ) );
});

var logical_and_expression = lazy(function() {
    return inclusive_or_expression
        .or( logical_and_expression.then( AND_OP ).then( inclusive_or_expression ) );
});

var logical_xor_expression = lazy(function() {
    return logical_and_expression
        .or( logical_xor_expression.then( XOR_OP ).then( logical_and_expression ) );
});

var logical_or_expression = lazy(function() {
    return logical_xor_expression
        .or( logical_or_expression.then( OR_OP ).then( logical_xor_expression ) );
});

var conditional_expression = lazy(function() {
    return logical_or_expression
        .or( logical_or_expression.then( QUESTION ).then( expression ).then( COLON ).then( assignment_expression ) );
});

var assignment_expression = lazy(function() {
    return conditional_expression
        .or( unary_expression.then( assignment_operator ).then( assignment_expression ) );
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
    return assignment_expression
        .or( expression.then( COMMA ).then( assignment_expression ) );
});

var constant_expression = lazy(function() {
    return conditional_expression;
});

var declaration = lazy(function() {
    return ( function_prototype.skip( SEMICOLON ) )
        .or( init_declarator_list.skip( SEMICOLON ) )
        .or( PRECISION.then( precision_qualifier ).then( type_specifier ).skip( SEMICOLON ) )
        .or( type_qualifier.then( IDENTIFIER ).then( LEFT_BRACE ).then( struct_declaration_list ).then( RIGHT_BRACE ).skip( SEMICOLON ) )
        .or( type_qualifier.then( IDENTIFIER ).then( LEFT_BRACE ).then( struct_declaration_list ).then( RIGHT_BRACE ).then( IDENTIFIER ).skip( SEMICOLON ) )
        .or( type_qualifier.then( IDENTIFIER ).then( LEFT_BRACE ).then( struct_declaration_list ).then( RIGHT_BRACE ).then( IDENTIFIER ).then( array_specifier ).skip( SEMICOLON ) )
        .or( type_qualifier.skip( SEMICOLON ) )
        .or( type_qualifier.then( IDENTIFIER ).skip( SEMICOLON ) )
        .or( type_qualifier.then( IDENTIFIER ).then( identifier_list ).skip( SEMICOLON ) );
});

var identifier_list = lazy(function() {
    return ( COMMA.then( IDENTIFIER ) )
        .or( identifier_list.then( COMMA ).then( IDENTIFIER ) );
});

var function_prototype = lazy(function() {
    return ( function_declarator.then( RIGHT_PAREN ) );
});

var function_declarator = lazy(function() {
    return function_header
        .or( function_header_with_parameters );
});

var function_header_with_parameters = lazy(function() {
    return ( function_header.then( parameter_declaration ) )
        .or( function_header_with_parameters.then( COMMA ).then( parameter_declaration ) );
});

var function_header = lazy(function() {
    return ( fully_specified_type.then( IDENTIFIER ).then( LEFT_PAREN ) );
});

var parameter_declarator = lazy(function() {
    return ( type_specifier.then( IDENTIFIER ) )
        .or( type_specifier.then( IDENTIFIER ).then( array_specifier ) );
});

var parameter_declaration = lazy(function() {
    return ( type_qualifier.then( parameter_declarator ) )
        .or( parameter_declarator )
        .or( type_qualifier.then( parameter_type_specifier ) )
        .or( parameter_type_specifier );
});

var parameter_type_specifier = lazy(function() {
    return type_specifier;
});

var init_declarator_list = lazy(function() {
    return single_declaration
        .or( init_declarator_list.then( COMMA ).then( IDENTIFIER ) )
        .or( init_declarator_list.then( COMMA ).then( IDENTIFIER ).then( array_specifier ) )
        .or( init_declarator_list.then( COMMA ).then( IDENTIFIER ).then( array_specifier ).then( EQUAL ).then( initializer ) )
        .or( init_declarator_list.then( COMMA ).then( IDENTIFIER ).then( EQUAL ).then( initializer ) );
});

var single_declaration = lazy(function() {
    return fully_specified_type
        .or( fully_specified_type.then( IDENTIFIER ) )
        .or( fully_specified_type.then( IDENTIFIER ).then( array_specifier ) )
        .or( fully_specified_type.then( IDENTIFIER ).then( array_specifier ).then( EQUAL ).then( initializer ) )
        .or( fully_specified_type.then( IDENTIFIER ).then( EQUAL ).then( initializer ) );
});

var fully_specified_type = lazy(function() {
    return type_specifier
        .or( type_qualifier.then( type_specifier ) );
});

var invariant_qualifier = lazy(function() {
    return INVARIANT;
});

var interpolation_qualifier = lazy(function() {
    return SMOOTH
        .or( FLAT )
        .or( NOPERSPECTIVE );
});

var layout_qualifier = lazy(function() {
    return ( LAYOUT.then( LEFT_PAREN ).then( layout_qualifier_id_list ).then( RIGHT_PAREN ) );
});

var layout_qualifier_id_list = lazy(function() {
    return layout_qualifier_id
        .or( layout_qualifier_id_list.then( COMMA ).then( layout_qualifier_id ) );
});

var layout_qualifier_id = lazy(function() {
    return IDENTIFIER
        .or( IDENTIFIER.then( EQUAL ).then( constant_expression ) )
        .or( SHARED );
});

var precise_qualifier = lazy(function() {
    return PRECISE;
});

var type_qualifier = lazy(function() {
    return single_type_qualifier
        .or( type_qualifier.then( single_type_qualifier ) );
});

var single_type_qualifier = lazy(function() {
    return storage_qualifier
        .or( layout_qualifier )
        .or( precision_qualifier )
        .or( interpolation_qualifier )
        .or( invariant_qualifier )
        .or( precise_qualifier );
});

var storage_qualifier = lazy(function() {
    return CONST
        .or( INOUT )
        .or( IN )
        .or( OUT )
        .or( CENTROID )
        .or( PATCH )
        .or( SAMPLE )
        .or( UNIFORM )
        .or( BUFFER )
        .or( SHARED )
        .or( COHERENT )
        .or( VOLATILE )
        .or( RESTRICT )
        .or( READONLY )
        .or( WRITEONLY )
        .or( SUBROUTINE )
        .or( SUBROUTINE.then( LEFT_PAREN ).then( type_name_list ).then( RIGHT_PAREN ) );
});

var type_name_list = lazy(function() {
    return TYPE_NAME
        .or( type_name_list.then( COMMA ).then( TYPE_NAME ) );
});

var type_specifier = lazy(function() {
    return type_specifier_nonarray
        .or( type_specifier_nonarray.then( array_specifier ) );
});

var array_specifier = lazy(function() {
    return ( LEFT_BRACKET.then( RIGHT_BRACKET ) )
        .or( LEFT_BRACKET.then( constant_expression ).then( RIGHT_BRACKET ) )
        .or( array_specifier.then( LEFT_BRACKET ).then( RIGHT_BRACKET ) )
        .or( array_specifier.then( LEFT_BRACKET ).then( constant_expression ).then( RIGHT_BRACKET ) );
});

var type_specifier_nonarray = lazy(function() {
    return VOID
        .or( FLOAT )
        .or( DOUBLE )
        .or( INT )
        .or( UINT )
        .or( BOOL )
        .or( VEC2 )
        .or( VEC3 )
        .or( VEC4 )
        .or( DVEC2 )
        .or( DVEC3 )
        .or( DVEC4 )
        .or( BVEC2 )
        .or( BVEC3 )
        .or( BVEC4 )
        .or( IVEC2 )
        .or( IVEC3 )
        .or( IVEC4 )
        .or( UVEC2 )
        .or( UVEC3 )
        .or( UVEC4 )
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
        .or( DMAT2 )
        .or( DMAT3 )
        .or( DMAT4 )
        .or( DMAT2X2 )
        .or( DMAT2X3 )
        .or( DMAT2X4 )
        .or( DMAT3X2 )
        .or( DMAT3X3 )
        .or( DMAT3X4 )
        .or( DMAT4X2 )
        .or( DMAT4X3 )
        .or( DMAT4X4 )
        .or( ATOMIC_UINT )
        .or( SAMPLER1D )
        .or( SAMPLER2D )
        .or( SAMPLER3D )
        .or( SAMPLERCUBE )
        .or( SAMPLER1DSHADOW )
        .or( SAMPLER2DSHADOW )
        .or( SAMPLERCUBESHADOW )
        .or( SAMPLER1DARRAY )
        .or( SAMPLER2DARRAY )
        .or( SAMPLER1DARRAYSHADOW )
        .or( SAMPLER2DARRAYSHADOW )
        .or( SAMPLERCUBEARRAY )
        .or( SAMPLERCUBEARRAYSHADOW )
        .or( ISAMPLER1D )
        .or( ISAMPLER2D )
        .or( ISAMPLER3D )
        .or( ISAMPLERCUBE )
        .or( ISAMPLER1DARRAY )
        .or( ISAMPLER2DARRAY )
        .or( ISAMPLERCUBEARRAY )
        .or( USAMPLER1D )
        .or( USAMPLER2D )
        .or( USAMPLER3D )
        .or( USAMPLERCUBE )
        .or( USAMPLER1DARRAY )
        .or( USAMPLER2DARRAY )
        .or( USAMPLERCUBEARRAY )
        .or( SAMPLER2DRECT )
        .or( SAMPLER2DRECTSHADOW )
        .or( ISAMPLER2DRECT )
        .or( USAMPLER2DRECT )
        .or( SAMPLERBUFFER )
        .or( ISAMPLERBUFFER )
        .or( USAMPLERBUFFER )
        .or( SAMPLER2DMS )
        .or( ISAMPLER2DMS )
        .or( USAMPLER2DMS )
        .or( SAMPLER2DMSARRAY )
        .or( ISAMPLER2DMSARRAY )
        .or( USAMPLER2DMSARRAY )
        .or( IMAGE1D )
        .or( IIMAGE1D )
        .or( UIMAGE1D )
        .or( IMAGE2D )
        .or( IIMAGE2D )
        .or( UIMAGE2D )
        .or( IMAGE3D )
        .or( IIMAGE3D )
        .or( UIMAGE3D )
        .or( IMAGE2DRECT )
        .or( IIMAGE2DRECT )
        .or( UIMAGE2DRECT )
        .or( IMAGECUBE )
        .or( IIMAGECUBE )
        .or( UIMAGECUBE )
        .or( IMAGEBUFFER )
        .or( IIMAGEBUFFER )
        .or( UIMAGEBUFFER )
        .or( IMAGE1DARRAY )
        .or( IIMAGE1DARRAY )
        .or( UIMAGE1DARRAY )
        .or( IMAGE2DARRAY )
        .or( IIMAGE2DARRAY )
        .or( UIMAGE2DARRAY )
        .or( IMAGECUBEARRAY )
        .or( IIMAGECUBEARRAY )
        .or( UIMAGECUBEARRAY )
        .or( IMAGE2DMS )
        .or( IIMAGE2DMS )
        .or( UIMAGE2DMS )
        .or( IMAGE2DMSARRAY )
        .or( IIMAGE2DMSARRAY )
        .or( UIMAGE2DMSARRAY )
        .or( struct_specifier )
        .or( TYPE_NAME );
});

var precision_qualifier = lazy(function() {
    return HIGH_PRECISION
        .or( MEDIUM_PRECISION )
        .or( LOW_PRECISION );
});

var struct_specifier = lazy(function() {
    return ( STRUCT.then( IDENTIFIER ).then( LEFT_BRACE ).then( struct_declaration_list ).then( RIGHT_BRACE ) )
        .or( STRUCT.then( LEFT_BRACE ).then( struct_declaration_list ).then( RIGHT_BRACE ) );
});

var struct_declaration_list = lazy(function() {
    return struct_declaration
        .or( struct_declaration_list.then( struct_declaration ) );
});

var struct_declaration = lazy(function() {
    return ( type_specifier.then( struct_declarator_list ).skip( SEMICOLON ) )
        .or( type_qualifier.then( type_specifier ).then( struct_declarator_list ).skip( SEMICOLON ) );
});

var struct_declarator_list = lazy(function() {
    return struct_declarator
        .or( struct_declarator_list.then( COMMA ).then( struct_declarator ) );
});

var struct_declarator = lazy(function() {
    return IDENTIFIER
        .or( IDENTIFIER.then( array_specifier ) );
});

var initializer = lazy(function() {
    return assignment_expression
        .or( LEFT_BRACE.then( initializer_list ).then( RIGHT_BRACE ) )
        .or( LEFT_BRACE.then( initializer_list ).then( COMMA ).then( RIGHT_BRACE ) );
});

var initializer_list = lazy(function() {
    return initializer
        .or( initializer_list.then( COMMA ).then( initializer ) );
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
        .or( switch_statement )
        .or( case_label )
        .or( iteration_statement )
        .or( jump_statement );
});

var compound_statement = lazy(function() {
    return ( LEFT_BRACE.then( RIGHT_BRACE ) )
        .or( LEFT_BRACE.then( statement_list ).then( RIGHT_BRACE ) );
});

var statement_no_new_scope = lazy(function() {
    return compound_statement_no_new_scope
        .or( simple_statement );
});

var compound_statement_no_new_scope = lazy(function() {
    return ( LEFT_BRACE.then( RIGHT_BRACE ) )
        .or( LEFT_BRACE.then( statement_list ).then( RIGHT_BRACE ) );
});

var statement_list = lazy(function() {
    return statement
        .or( statement_list.then( statement ) );
});

var expression_statement = lazy(function() {
    return SEMICOLON
        .or( expression.skip( SEMICOLON ) );
});

var selection_statement = lazy(function() {
    return ( IF.then( LEFT_PAREN ).then( expression ).then( RIGHT_PAREN ).then( selection_rest_statement ) );
});

var selection_rest_statement = lazy(function() {
    return ( statement.then( ELSE ).then( statement ) )
        .or( statement );
});

var condition = lazy(function() {
    return expression
        .or( fully_specified_type.then( IDENTIFIER ).then( EQUAL ).then( initializer ) );
});

var switch_statement = lazy(function() {
    return ( SWITCH.then( LEFT_PAREN ).then( expression ).then( RIGHT_PAREN ).then( LEFT_BRACE ).then( switch_statement_list ).then( RIGHT_BRACE ) );
});

var switch_statement_list = lazy(function() {
    return statement_list;
});

var case_label = lazy(function() {
    return ( CASE.then( expression ).then( COLON ) )
        .or( DEFAULT.then( COLON ) );
});

var iteration_statement = lazy(function() {
    return ( WHILE.then( LEFT_PAREN ).then( condition ).then( RIGHT_PAREN ).then( statement_no_new_scope ) )
        .or( DO.then( statement ).then( WHILE ).then( LEFT_PAREN ).then( expression ).then( RIGHT_PAREN ).skip( SEMICOLON ) )
        .or( FOR.then( LEFT_PAREN ).then( for_init_statement ).then( for_rest_statement ).then( RIGHT_PAREN ).then( statement_no_new_scope ) );
});

var for_init_statement = lazy(function() {
    return expression_statement
        .or( declaration_statement );
});

var conditionopt = lazy(function() {
    return condition;
});

var for_rest_statement = lazy(function() {
    return ( conditionopt.skip( SEMICOLON ) )
        .or( conditionopt.skip( SEMICOLON ).then( expression ) );
});

var jump_statement = lazy(function() {
    return ( CONTINUE.skip( SEMICOLON ) )
        .or( BREAK.skip( SEMICOLON ) )
        .or( RETURN.skip( SEMICOLON ) )
        .or( RETURN.then( expression ).skip( SEMICOLON ) )
        .or( DISCARD.skip( SEMICOLON ) );
});

var translation_unit = lazy(function() {
    return header_preprocessor.many();
});

// MODIFIED: Not part of the grammar. Includes #preprocessor grammars.
var header_preprocessor = lazy(function() {
    return preprocessor_directive.or( external_declaration );
});

var external_declaration = lazy(function() {
    return function_definition.or( declaration );
});

var function_definition = lazy(function() {
    return ( function_prototype.then( compound_statement_no_new_scope ) );
});
