var terminator = ';\n';

//var rules = {
    //'=': function( node ) {
        //return walk( node.left ) + '=' + walk( node.right ) + terminator;
    //},
    //'decleration': function( node ) {
        //return [ node.typeDec, node.name ].join(' ') + terminator;
    //},
    //'invocation': function( node ) {
        //return node.name + '(' + _.map( node['arguments'], walk ).join(',') + ')';
    //},
    //'name': function( node ) {
        //return [ node.typeDec, node.value ].join(' ');
    //},
    //'literal': function( node ) {
        //return node.value;
    //},
    //'function': function( node ) {
        //return node.typeDec + ' ' + node.name + '(' +
                //walk( node.parameters ) +
            //'){\n' + walk( node.body ) + '}';

    //}
//};

var merge = function() {
};

//console.log( Ast.buildTree( window.vert2 ) );

console.log(  translation_unit.parse('\
#ifdef GL_ES\n\
precision mediump float;\n\
#endif\n\
uniform float time;\
'));

console.log(  translation_unit.parse('\
#ifdef GL_ES\n\
precision mediump float;\n\
#endif\n\
uniform float time;\
uniform float prevTime;\
uniform vec2 mouse;\
uniform vec2 resolution;\
uniform sampler2D backbuffer;\
vec3 hueShift(float shifter, vec3 inRGB)\
{\
    vec3 yiq = rgb2yiq * meow(inRGB) + 1;\n\
    float h = (shifter) + atan();\
    float chroma = sqrt( yiq.b * yiq.b + yiq.g * yiq.g );\
    vec3 rgb = yiq2rgb * vec3( yiq.r, chroma * cos(h), chroma * sin(h) );\n\
    return rgb;\
}\
 '));
