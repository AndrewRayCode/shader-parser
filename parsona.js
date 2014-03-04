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


variable_identifier:
 IDENTIFIER

primary_expression:
 variable_identifier
 INTCONSTANT
 FLOATCONSTANT
 BOOLCONSTANT
 LEFT_PAREN expression RIGHT_PAREN

postfix_expression:
 primary_expression
 postfix_expression LEFT_BRACKET integer_expression RIGHT_BRACKET
 function_call
 postfix_expression DOT FIELD_SELECTION
 postfix_expression INC_OP
 postfix_expression DEC_OP

integer_expression:
 expression

function_call:
 function_call_or_method

function_call_or_method:
 function_call_generic
 postfix_expression DOT function_call_generic

function_call_generic:
 function_call_header_with_parameters RIGHT_PAREN
 function_call_header_no_parameters RIGHT_PAREN

function_call_header_no_parameters:
 function_call_header VOID
 function_call_header

function_call_header_with_parameters:
 function_call_header assignment_expression
 function_call_header_with_parameters COMMA assignment_expression

function_call_header:
 function_identifier LEFT_PAREN

function_identifier:
 type_specifier
 IDENTIFIER
 FIELD_SELECTION

unary_expression:
 postfix_expression
 INC_OP unary_expression
 DEC_OP unary_expression
 unary_operator unary_expression

unary_operator:
 PLUS
 DASH
 BANG
 TILDE

multiplicative_expression:
 unary_expression
 multiplicative_expression STAR unary_expression
 multiplicative_expression SLASH unary_expression
 multiplicative_expression PERCENT unary_expression

additive_expression:
 multiplicative_expression
 additive_expression PLUS multiplicative_expression
 additive_expression DASH multiplicative_expression

shift_expression:
 additive_expression
 shift_expression LEFT_OP additive_expression
 shift_expression RIGHT_OP additive_expression

relational_expression:
 shift_expression
 relational_expression LEFT_ANGLE shift_expression
 relational_expression RIGHT_ANGLE shift_expression
 relational_expression LE_OP shift_expression
 relational_expression GE_OP shift_expression

equality_expression:
 relational_expression
 equality_expression EQ_OP relational_expression
 equality_expression NE_OP relational_expression

and_expression:
 equality_expression
 and_expression AMPERSAND equality_expression

exclusive_or_expression:
 and_expression
 exclusive_or_expression CARET and_expression

inclusive_or_expression:
 exclusive_or_expression
 inclusive_or_expression VERTICAL_BAR exclusive_or_expression

logical_and_expression:
 inclusive_or_expression
 logical_and_expression AND_OP inclusive_or_expression

logical_xor_expression:
 logical_and_expression
 logical_xor_expression XOR_OP logical_and_expression

logical_or_expression:
 logical_xor_expression
 logical_or_expression OR_OP logical_xor_expression

conditional_expression:
 logical_or_expression
 logical_or_expression QUESTION expression COLON assignment_expression

assignment_expression:
 conditional_expression
 unary_expression assignment_operator assignment_expression

assignment_operator:
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

expression:
 assignment_expression
 expression COMMA assignment_expression

constant_expression:
 conditional_expression

declaration:
 function_prototype SEMICOLON
 init_declarator_list SEMICOLON

function_prototype:
 function_declarator RIGHT_PAREN

function_declarator:
 function_header
 function_header_with_parameters

function_header_with_parameters:
 function_header parameter_declaration
 function_header_with_parameters COMMA parameter_declaration

function_header:
 fully_specified_type IDENTIFIER LEFT_PAREN

parameter_declarator:
 type_specifier IDENTIFIER
 type_specifier IDENTIFIER LEFT_BRACKET constant_expression RIGHT_BRACKET

parameter_declaration:
 type_qualifier parameter_qualifier parameter_declarator
 parameter_qualifier parameter_declarator
 type_qualifier parameter_qualifier parameter_type_specifier
 parameter_qualifier parameter_type_specifier

parameter_qualifier:
 /* empty */
 IN
 OUT
 INOUT

parameter_type_specifier:
 type_specifier

init_declarator_list:
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

single_declaration:
 fully_specified_type
 fully_specified_type IDENTIFIER
 fully_specified_type IDENTIFIER LEFT_BRACKET RIGHT_BRACKET
 fully_specified_type IDENTIFIER LEFT_BRACKET constant_expression RIGHT_BRACKET
 fully_specified_type IDENTIFIER LEFT_BRACKET RIGHT_BRACKET EQUAL initializer
 fully_specified_type IDENTIFIER LEFT_BRACKET constant_expression
 RIGHT_BRACKET EQUAL initializer
 fully_specified_type IDENTIFIER EQUAL initializer
 INVARIANT IDENTIFIER

fully_specified_type:
 type_specifier
 type_qualifier type_specifier

type_qualifier:
 CONST
 ATTRIBUTE
 VARYING
 CENTROID VARYING
 INVARIANT VARYING
 INVARIANT CENTROID VARYING
 UNIFORM

type_specifier:
 type_specifier_nonarray
 type_specifier_nonarray LEFT_BRACKET constant_expression RIGHT_BRACKET

type_specifier_nonarray:
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

struct_specifier:
 STRUCT IDENTIFIER LEFT_BRACE struct_declaration_list RIGHT_BRACE
 STRUCT LEFT_BRACE struct_declaration_list RIGHT_BRACE

struct_declaration_list:
 struct_declaration
 struct_declaration_list struct_declaration

struct_declaration:
 type_specifier struct_declarator_list SEMICOLON

struct_declarator_list:
 struct_declarator
 struct_declarator_list COMMA struct_declarator

struct_declarator:
 IDENTIFIER
 IDENTIFIER LEFT_BRACKET constant_expression RIGHT_BRACKET

initializer:
 assignment_expression

declaration_statement:
 declaration

statement:
 compound_statement
 simple_statement

simple_statement:
 declaration_statement
 expression_statement
 selection_statement
 iteration_statement
 jump_statement

compound_statement:
 LEFT_BRACE RIGHT_BRACE
 LEFT_BRACE statement_list RIGHT_BRACE

statement_no_new_scope:
 compound_statement_no_new_scope
 simple_statement

compound_statement_no_new_scope:
 LEFT_BRACE RIGHT_BRACE
 LEFT_BRACE statement_list RIGHT_BRACE

statement_list:
 statement
 statement_list statement

expression_statement:
 SEMICOLON
 expression SEMICOLON

selection_statement:
 IF LEFT_PAREN expression RIGHT_PAREN selection_rest_statement

selection_rest_statement:
 statement ELSE statement
 statement

condition:
 expression
 fully_specified_type IDENTIFIER EQUAL initializer

iteration_statement:
 WHILE LEFT_PAREN condition RIGHT_PAREN statement_no_new_scope
 DO statement WHILE LEFT_PAREN expression RIGHT_PAREN SEMICOLON
 FOR LEFT_PAREN for_init_statement for_rest_statement RIGHT_PAREN statement_no_new_scope

for_init_statement:
 expression_statement
 declaration_statement

conditionopt:
 condition
 empty

for_rest_statement:
 conditionopt SEMICOLON
 conditionopt SEMICOLON expression

jump_statement:
 CONTINUE SEMICOLON
 BREAK SEMICOLON
 RETURN SEMICOLON
 RETURN expression SEMICOLON
 DISCARD SEMICOLON

translation_unit:
 external_declaration
 translation_unit external_declaration

external_declaration:
 function_definition
 declaration

function_definition:
 function_prototype compound_statement_no_new_scope
