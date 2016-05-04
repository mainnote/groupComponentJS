define(['jquery', 'component', 'tpl!templates/inputList'
	], function ($, Component, tpl) {
    var InputList = Component.create('InputList');
    InputList.extend({
        defaultOpt: {
            inputList_lable: 'Choose and add: ',
            inputList_header: 'Select a source',
            inputList_options: [{
                key: 1,
                value: 'one'
            }, {
                key: 2,
                value: 'two'
            }]
        },
        tpl: tpl
    });

    return InputList;
});
