define(['jquery', 'component', 'tpl!templates/error'
	], function ($, Component, tpl) {
    var Error = Component.create('Error');
    Error.extend({
        tpl: tpl,
        defaultOpt: {
            message: '',
            errors: []
        },
    });

    return Error;
});
