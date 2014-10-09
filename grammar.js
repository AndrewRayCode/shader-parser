// It is unclear to me why the grammar specifies rules like this, but including
// to avoid confusion if we have to compare back to original grammar later
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
        .or( LEFT_PAREN.then( expression ).skip( RIGHT_PAREN ) );/*.map( function( expr ) {
            return {
                nodeType: 'group',
                body: expr
            };
        }));*/
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

// Again, I do not understand why the grammar has these explicit rules, but
// keeping for sake of comparison to original
var function_call = lazy(function() {
    return function_call_or_method;
});

var function_call_or_method = lazy(function() {
    return function_call_generic;
});

var function_call_generic = lazy(function() {
    return ( function_call_header_with_parameters.skip( RIGHT_PAREN ) )
        .or( function_call_header_no_parameters.skip( RIGHT_PAREN ) );
});

var function_call_header_no_parameters = lazy(function() {
    return mapp([
        { header: function_call_header },
        { arguments: VOID },/*.map(function( expr ) { return [ expr ]; }) }*/
    ], { nodeType: 'function_call' }).or( mapp([
        { header: function_call_header }
    ], { nodeType: 'function_call', 'arguments': [] }) );
});

var function_call_header_with_parameters = lazy(function() {
    return ( mapp([
        { header: function_call_header },
        { 'arguments': assignment_expression }/*.map(function( expr ) { return [ expr ]; }) }, */
    ])).or( seq([ function_call_header_with_parameters.skip( COMMA ), assignment_expression ]) );/*.map(function( xs ) {
        return {
            header: xs[0].header,
            arguments: xs[0]['arguments'].concat( xs[1] )
        };
    }) );*/
});

var function_call_header = lazy(function() {
    return  function_identifier.skip( LEFT_PAREN );
    //return  mapp([
        //{ header: function_identifier.skip( LEFT_PAREN ) }
    //]);
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
        .or( infix( multiplicative_expression, STAR, unary_expression ) )
        .or( infix( multiplicative_expression, SLASH, unary_expression ) )
        .or( infix( multiplicative_expression, PERCENT, unary_expression ) );
});

var additive_expression = lazy(function() {
    return multiplicative_expression
        .or( infix( additive_expression, PLUS, multiplicative_expression ) )
        .or( infix( additive_expression, DASH, multiplicative_expression ) );
});

var shift_expression = lazy(function() {
    return additive_expression
        .or( infix( shift_expression, LEFT_OP, additive_expression ) )
        .or( infix( shift_expression, RIGHT_OP, additive_expression ) );
});

var relational_expression = lazy(function() {
    return shift_expression
        .or( infix( relational_expression, LEFT_ANGLE, shift_expression ) )
        .or( infix( relational_expression, RIGHT_ANGLE, shift_expression ) )
        .or( infix( relational_expression, LE_OP, shift_expression ) )
        .or( infix( relational_expression, GE_OP, shift_expression ) );
});

var equality_expression = lazy(function() {
    return relational_expression
        .or( infix( equality_expression, EQ_OP, relational_expression ) )
        .or( infix( equality_expression, NE_OP, relational_expression ) );
});

var and_expression = lazy(function() {
    return equality_expression
        .or( infix( and_expression, AMPERSAND, equality_expression ) );
});

var exclusive_or_expression = lazy(function() {
    return and_expression
        .or( infix( exclusive_or_expression, CARET, and_expression ) );
});

var inclusive_or_expression = lazy(function() {
    return exclusive_or_expression
        .or( infix( inclusive_or_expression, VERTICAL_BAR, exclusive_or_expression ) );
});

var logical_and_expression = lazy(function() {
    return inclusive_or_expression
        .or( infix( logical_and_expression, AND_OP, inclusive_or_expression ) );
});

var logical_xor_expression = lazy(function() {
    return logical_and_expression
        .or( infix( logical_xor_expression, XOR_OP, logical_and_expression ) );
});

var logical_or_expression = lazy(function() {
    return logical_xor_expression
        .or( infix( logical_or_expression, OR_OP, logical_xor_expression ) );
});

var conditional_expression = lazy(function() {
    return logical_or_expression
        .or( mapp([
            { question: logical_or_expression.skip( QUESTION ) },
            { first: expression.skip( COLON ) },
            { second: assignment_expression }
        ]));
});

var assignment_expression = lazy(function() {
    return conditional_expression
        .or( mapp([
            { expression: unary_expression },
            { operator: assignment_operator },
            { assignment: assignment_expression }
        ]) );
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
        .or( mapp([
                { precision: PRECISION },
                { qualifier: precision_qualifier },
                { type: type_specifier },
            ]).skip( SEMICOLON ) )
        .or( mapp([
            { type: type_qualifier },
            { name: IDENTIFIER.skip( LEFT_BRACE ) },
            { body: struct_declaration_list.skip( RIGHT_BRACE ) }
        ]).skip( SEMICOLON ) )
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
    return ( function_declarator.skip( RIGHT_PAREN ) );
});

var function_declarator = lazy(function() {
    return function_header
        .or( function_header_with_parameters );
});

var function_header_with_parameters = lazy(function() {
    return ( mapp([
        { header: function_header },
        { 'arguments': parameter_declaration } /*.map(function( expr ) { return [ expr ]; }) },*/
    ])).or( seq([ function_header_with_parameters.skip( COMMA ), parameter_declaration ]) ); /*.map(function( xs ) {
        return {
            header: xs[0].header,
            arguments: xs[0]['arguments'].concat( xs[1] )
        };
    }) );*/
});

var function_header = lazy(function() {
    return mapp([
        { type: fully_specified_type },
        { name: IDENTIFIER.skip( LEFT_PAREN ) }
    ]);
});

var parameter_declarator = lazy(function() {
    return ( mapp([
        { type: type_specifier },
        { name: IDENTIFIER }
    ]))
    .or( mapp([
        { type: type_specifier },
        { name: IDENTIFIER },
        { subArr: array_specifier }
    ]));
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
        .or( mapp([
            { type: fully_specified_type },
            { name: IDENTIFIER }
        ]) )
        .or( mapp([
            { type: fully_specified_type },
            { name: IDENTIFIER },
            { array_specifier: array_specifier }
        ]) )
        .or( infix([
            { type: fully_specified_type },
            { name: IDENTIFIER },
            { array_specifier: array_specifier }
        ], EQUAL, initializer ))
        .or( infix([
            { type: fully_specified_type },
            { name: IDENTIFIER }
        ], EQUAL, initializer ));
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
        .or( LEFT_BRACE.then( initializer_list ).skip( RIGHT_BRACE ) )
        .or( LEFT_BRACE.then( initializer_list ).skip( COMMA ).skip( RIGHT_BRACE ) );
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
    return ( LEFT_BRACE.skip( RIGHT_BRACE ) )/*.map( function() { return {}; } ) ) */
        .or( LEFT_BRACE.then( statement_list ).skip( RIGHT_BRACE ) );
});

var statement_list = lazy(function() {
    return statement.many();
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
    return mapp([
        { definition: function_prototype },
        { body: compound_statement_no_new_scope }
    ]);
});
