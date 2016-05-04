define(['jquery', 'component', 'tpl!templates/error'
	], function ($, Component, tpl) {
	var Error = Component.create('Error');
	Error.extend({
        defaultOpt: {
            message: '',
            errors: []
        },
        tpl: tpl,
	});
    
    return Error;
});