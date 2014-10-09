var preprocessor_directives = lazy(function() {
    return ( _regex('#') )
        .or( _regex('#define') )
        .or( _regex('#undef') )
        .or( _regex('#if') )
        .or( _regex('#ifdef') )
        .or( _regex('#ifndef') )
        .or( _regex('#else') )
        .or( _regex('#elif') )
        .or( _regex('#endif') )
        .or( _regex('#error') )
        .or( _regex('#pragma') )
        .or( _regex('#extension') )
        .or( _regex('#version') )
        .or( _regex('#line') );
});

var preprocessor_directive = lazy(function() {
    return preprocessor_directives.then( _regex(/.*?(\r|\n|$)/) );
});
