var vert1 = [{
    'nodeType': 'decleration',
    'name': 'viewVector',
    'typeDec': 'uniform vec3'
}, {
    'nodeType': 'function',
    'typeDec': 'void',
    'name': 'main',
    'parameters': [],
    'body': []
}, {
    'nodeType': 'function',
    'typeDec': 'void',
    'name': 'main',
    'parameters': [],
    'body': [{
        'nodeType': '=',
        'left': {
            'value': 'myColor',
            'nodeType': 'name',
            'typeDec': 'vec3'
        },
        'right': {
            'nodeType': 'invocation',
            'name': 'vec3',
            'arguments': [{
                'value': '1.0',
                'nodeType': 'literal'
            }]
        }
    }, {
        'nodeType': '=',
        'left': {
            'value': 'gl_FragColor',
            'nodeType': 'name',
            'typeDec': ''
        },
        'right': {
            'nodeType': 'invocation',
            'name': 'vec4',
            'arguments': [{
                'value': 'myColor',
                'nodeType': 'name'
            }, {
                'nodeType': 'literal',
                'value': '1.0'
            }]
        }
    }]
}];
