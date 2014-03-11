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

console.log( Ast.buildTree( window.vert2 ) );
