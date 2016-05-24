define(['jquery', 'inputListGrp', 'tpl!templates/inputList_selection', 'formOption_selection'
	], function ($, InputListGrp, tpl, FormOption_selection) {
    var formOption = FormOption_selection.create('formOption');
    var inputListGrp_selection = InputListGrp.create('inputListGrp_selection');
    var inputList = inputListGrp_selection.getMember('inputList');
    var inputList_setup = inputList.setup;
    inputList.extend({
        tpl: tpl,
        defaultOpt: $.extend({}, inputList.defaultOpt, {
            inputList_lable: 'Choose and add: ',
            inputList_header: 'Select a source',
            inputList_options: [{
                key: '1',
                value: 'one'
            }, {
                key: '2',
                value: 'two'
            }]
        }),
        setup: function (opt) {
            var that = this;
            inputList_setup.call(this, opt);
            var selection = this.comp.find('select');
            selection.on('change', function () {
                var option = selection.find('option:selected');
                that.group.call('formOption', 'setKey', {
                    optionKey: option.val()
                });
            });
            return this.comp;
        },
    });

    inputListGrp_selection.override(formOption);


    return inputListGrp_selection;
});
