var

    // User tokens
    FLOATCONSTANT = regex(/^-?\d+(([.]|e[+-]?)\d+)?/i),
    INTCONSTANT = regex(/^-?\d+/i),
    BOOLCONSTANT = regex(/true|false/),
    IDENTIFIER = regex(/^[a-z_][a-z0-9_]*/i),
    TYPE_NAME = regex(/^[a-z_][a-z0-9_]*/i), // ? Can't find this in spec
    FIELD_SELECTION = IDENTIFIER, // this is not clearly defined in the spec

    // Words defined by the spec
    ATTRIBUTE = regex('ATTRIBUTE'),
    CONST = regex('CONST'),
    FLOAT = regex('FLOAT'),
    INT = regex('INT'),
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
    IDENTIFIER
});

var primary_expression = lazy(function() {
    variable_identifier
    INTCONSTANT
    FLOATCONSTANT
    BOOLCONSTANT
    LEFT_PAREN expression RIGHT_PAREN
});

var postfix_expression = lazy(function() {
    primary_expression
    postfix_expression LEFT_BRACKET integer_expression RIGHT_BRACKET
    function_call
    postfix_expression DOT FIELD_SELECTION
    postfix_expression INC_OP
    postfix_expression DEC_OP
});

var integer_expression = lazy(function() {
    expression
});

var function_call = lazy(function() {
    function_call_or_method
});

var function_call_or_method = lazy(function() {
    function_call_generic
    postfix_expression DOT function_call_generic
});

var function_call_generic = lazy(function() {
    function_call_header_with_parameters RIGHT_PAREN
    function_call_header_no_parameters RIGHT_PAREN
});

var function_call_header_no_parameters = lazy(function() {
    function_call_header VOID
    function_call_header
});

var function_call_header_with_parameters = lazy(function() {
    function_call_header assignment_expression
    function_call_header_with_parameters COMMA assignment_expression
});

var function_call_header = lazy(function() {
    function_identifier LEFT_PAREN
});

var function_identifier = lazy(function() {
    type_specifier
    IDENTIFIER
    FIELD_SELECTION
});

var unary_expression = lazy(function() {
    postfix_expression
    INC_OP unary_expression
    DEC_OP unary_expression
    unary_operator unary_expression
});

var unary_operator = lazy(function() {
    PLUS
    DASH
    BANG
    TILDE
});

var multiplicative_expression = lazy(function() {
    unary_expression
    multiplicative_expression STAR unary_expression
    multiplicative_expression SLASH unary_expression
    multiplicative_expression PERCENT unary_expression
});

var additive_expression = lazy(function() {
    multiplicative_expression
    additive_expression PLUS multiplicative_expression
    additive_expression DASH multiplicative_expression
});

var shift_expression = lazy(function() {
    additive_expression
    shift_expression LEFT_OP additive_expression
    shift_expression RIGHT_OP additive_expression
});

var relational_expression = lazy(function() {
    shift_expression
    relational_expression LEFT_ANGLE shift_expression
    relational_expression RIGHT_ANGLE shift_expression
    relational_expression LE_OP shift_expression
    relational_expression GE_OP shift_expression
});

var equality_expression = lazy(function() {
    relational_expression
    equality_expression EQ_OP relational_expression
    equality_expression NE_OP relational_expression
});

var and_expression = lazy(function() {
    equality_expression
    and_expression AMPERSAND equality_expression
});

var exclusive_or_expression = lazy(function() {
    and_expression
    exclusive_or_expression CARET and_expression
});

var inclusive_or_expression = lazy(function() {
    exclusive_or_expression
    inclusive_or_expression VERTICAL_BAR exclusive_or_expression
});

var logical_and_expression = lazy(function() {
    inclusive_or_expression
    logical_and_expression AND_OP inclusive_or_expression
});

var logical_xor_expression = lazy(function() {
    logical_and_expression
    logical_xor_expression XOR_OP logical_and_expression
});

var logical_or_expression = lazy(function() {
    logical_xor_expression
    logical_or_expression OR_OP logical_xor_expression
});

var conditional_expression = lazy(function() {
    logical_or_expression
    logical_or_expression QUESTION expression COLON assignment_expression
});

var assignment_expression = lazy(function() {
    conditional_expression
    unary_expression assignment_operator assignment_expression
});

var assignment_operator = lazy(function() {
    EQUAL
    MUL_ASSIGN
    DIV_ASSIGN
    MOD_ASSIGN
    ADD_ASSIGN
    SUB_ASSIGN
    LEFT_ASSIGN
    RIGHT_ASSIGN
    AND_ASSIGN
    XOR_ASSIGN
    OR_ASSIGN
});

var expression = lazy(function() {
    assignment_expression
    expression COMMA assignment_expression
});

var constant_expression = lazy(function() {
    conditional_expression
});

var declaration = lazy(function() {
    function_prototype SEMICOLON
    init_declarator_list SEMICOLON
});

var function_prototype = lazy(function() {
    function_declarator RIGHT_PAREN
});

var function_declarator = lazy(function() {
    function_header
    function_header_with_parameters
});

var function_header_with_parameters = lazy(function() {
    function_header parameter_declaration
    function_header_with_parameters COMMA parameter_declaration
});

var function_header = lazy(function() {
    fully_specified_type IDENTIFIER LEFT_PAREN
});

var parameter_declarator = lazy(function() {
    type_specifier IDENTIFIER
    type_specifier IDENTIFIER LEFT_BRACKET constant_expression RIGHT_BRACKET
});

var parameter_declaration = lazy(function() {
    type_qualifier parameter_qualifier parameter_declarator
    parameter_qualifier parameter_declarator
    type_qualifier parameter_qualifier parameter_type_specifier
    parameter_qualifier parameter_type_specifier
});

var parameter_qualifier = lazy(function() {
    /* empty */
    IN
    OUT
    INOUT
});

var parameter_type_specifier = lazy(function() {
    type_specifier
});

var init_declarator_list = lazy(function() {
    single_declaration
    init_declarator_list COMMA IDENTIFIER
    init_declarator_list COMMA IDENTIFIER LEFT_BRACKET RIGHT_BRACKET
    init_declarator_list COMMA IDENTIFIER LEFT_BRACKET constant_expression
    RIGHT_BRACKET
    init_declarator_list COMMA IDENTIFIER LEFT_BRACKET
    RIGHT_BRACKET EQUAL initializer
    init_declarator_list COMMA IDENTIFIER LEFT_BRACKET constant_expression
    RIGHT_BRACKET EQUAL initializer
    init_declarator_list COMMA IDENTIFIER EQUAL initializer
});

var single_declaration = lazy(function() {
    fully_specified_type
    fully_specified_type IDENTIFIER
    fully_specified_type IDENTIFIER LEFT_BRACKET RIGHT_BRACKET
    fully_specified_type IDENTIFIER LEFT_BRACKET constant_expression RIGHT_BRACKET
    fully_specified_type IDENTIFIER LEFT_BRACKET RIGHT_BRACKET EQUAL initializer
    fully_specified_type IDENTIFIER LEFT_BRACKET constant_expression
    RIGHT_BRACKET EQUAL initializer
    fully_specified_type IDENTIFIER EQUAL initializer
    INVARIANT IDENTIFIER
});

var fully_specified_type = lazy(function() {
    type_specifier
    type_qualifier type_specifier
});

var type_qualifier = lazy(function() {
    CONST
    ATTRIBUTE
    VARYING
    CENTROID VARYING
    INVARIANT VARYING
    INVARIANT CENTROID VARYING
    UNIFORM
});

var type_specifier = lazy(function() {
    type_specifier_nonarray
    type_specifier_nonarray LEFT_BRACKET constant_expression RIGHT_BRACKET
});

var type_specifier_nonarray = lazy(function() {
    VOID
    FLOAT
    INT
    BOOL
    VEC2
    VEC3
    VEC4
    BVEC2
    BVEC3
    BVEC4
    IVEC2
    IVEC3
    IVEC4
    MAT2
    MAT3
    MAT4
    MAT2X2
    MAT2X3
    MAT2X4
    MAT3X2
    MAT3X3
    MAT3X4
    MAT4X2
    MAT4X3
    MAT4X4
    SAMPLER1D
    SAMPLER2D
    SAMPLER3D
    SAMPLERCUBE
    SAMPLER1DSHADOW
    SAMPLER2DSHADOW
    struct_specifier
    TYPE_NAME
});

var struct_specifier = lazy(function() {
    STRUCT IDENTIFIER LEFT_BRACE struct_declaration_list RIGHT_BRACE
    STRUCT LEFT_BRACE struct_declaration_list RIGHT_BRACE
});

var struct_declaration_list = lazy(function() {
    struct_declaration
    struct_declaration_list struct_declaration
});

var struct_declaration = lazy(function() {
    type_specifier struct_declarator_list SEMICOLON
});

var struct_declarator_list = lazy(function() {
    struct_declarator
    struct_declarator_list COMMA struct_declarator
});

var struct_declarator = lazy(function() {
    IDENTIFIER
    IDENTIFIER LEFT_BRACKET constant_expression RIGHT_BRACKET
});

var initializer = lazy(function() {
    assignment_expression
});

var declaration_statement = lazy(function() {
    declaration
});

var statement = lazy(function() {
    compound_statement
    simple_statement
});

var simple_statement = lazy(function() {
    declaration_statement
    expression_statement
    selection_statement
    iteration_statement
    jump_statement
});

var compound_statement = lazy(function() {
    LEFT_BRACE RIGHT_BRACE
    LEFT_BRACE statement_list RIGHT_BRACE
});

var statement_no_new_scope = lazy(function() {
    compound_statement_no_new_scope
    simple_statement
});

var compound_statement_no_new_scope = lazy(function() {
    LEFT_BRACE RIGHT_BRACE
    LEFT_BRACE statement_list RIGHT_BRACE
});

var statement_list = lazy(function() {
    statement
    statement_list statement
});

var expression_statement = lazy(function() {
    SEMICOLON
    expression SEMICOLON
});

var selection_statement = lazy(function() {
    IF LEFT_PAREN expression RIGHT_PAREN selection_rest_statement
});

var selection_rest_statement = lazy(function() {
    statement ELSE statement
        statement
});

var condition = lazy(function() {
    expression
    fully_specified_type IDENTIFIER EQUAL initializer
});

var iteration_statement = lazy(function() {
    WHILE LEFT_PAREN condition RIGHT_PAREN statement_no_new_scope
        DO statement WHILE LEFT_PAREN expression RIGHT_PAREN SEMICOLON
            FOR LEFT_PAREN for_init_statement for_rest_statement RIGHT_PAREN statement_no_new_scope
});

var for_init_statement = lazy(function() {
    expression_statement
    declaration_statement
});

var conditionopt = lazy(function() {
    condition
    empty
});

var for_rest_statement = lazy(function() {
    conditionopt SEMICOLON
    conditionopt SEMICOLON expression
});

var jump_statement = lazy(function() {
    CONTINUE SEMICOLON
    BREAK SEMICOLON
    RETURN SEMICOLON
    RETURN expression SEMICOLON
    DISCARD SEMICOLON
});

var translation_unit = lazy(function() {
    external_declaration
    translation_unit external_declaration
});

var external_declaration = lazy(function() {
    function_definition
    declaration
});

var function_definition = lazy(function() {
    function_prototype compound_statement_no_new_scope
});
