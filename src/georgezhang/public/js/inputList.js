define(['jquery', 'component', 'tpl!templates/inputList'
	], function ($, Component, tpl) {
    var InputList = Component.create('InputList');
    InputList.extend({
        tpl: tpl,
        defaultOpt: {
            inputList_name: 'inputList_name',
            inputList_lable: 'Add: ',
            inputList_value: '',
        },
    });

    return InputList;
});
