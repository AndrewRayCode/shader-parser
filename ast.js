/* global Ast:true */
(function() {

var Ast = this.Ast = function( data ) {
    this.ast = data;
};

// Convert a json object into a list of nested node classes. This function may
// be obsolete if we build a new Ast in each parser output step
Ast.buildTree = function( tree ) {

    var output = [],
        subTrees, i, j, node, childTree;

    // If this is a list, boil down to the raw { nodes }
    if( tree.length ) {
        for( i = 0; node = tree[ i++ ]; ) {
            output.push( Ast.buildTree( node ) );
        }
        return new Ast( output );
    }

    // Handle a raw object
    node = new Ast( tree );

    // And walk its child objects
    _.map( Ast.subTrees[ node.nodeType ], function( key ) {
        node[ key ] = Ast.buildTree( node[ key ] );
    });

    return node;

};

Ast.subTrees = {
    'function' : [ 'parameters', 'body' ],
    '=': [ 'left', 'right' ],
    'invocation': [ 'arguments' ]
};

Ast.prototype.walk = function( fn ) {

    var input = _.isArray( this.ast ) ? this.ast : [ this.ast ],
        result,
        i, curNode;

    for( i = 0; curNode = input[ i++ ]; ) {
        if( fn( curNode ) ) {
            return;
        }
    }

};

//var findChild = function( node ) {
    //if( node.is( 'name' ) ) {
        //return true;
    //} else if( node.is( 'function' ) ) {
        //return node.walk( findChild );
    //}
    //return false;
//};

var tree;
//var found = tree.walk( findChild );

}());
