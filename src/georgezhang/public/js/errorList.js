define(['jquery', 'component', 'tpl!templates/errorList'
	], function ($, Component, tpl) {
    var ErrorList = Component.create('ErrorList');
    ErrorList.extend({
        tpl: tpl,
        defaultOpt: {
            message: '',
            errors: []
        },
    });

    return ErrorList;
});
