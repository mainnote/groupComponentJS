define(['jquery', 'component', 'tpl!templates/checkbox', 'bootstrap-switch'
	], function ($, Component, tpl) {
    var Checkbox = Component.create('Checkbox');
    Checkbox.extend({
        defaultOpt: {
            checkbox_id: 'checkbox_id',
            checkbox_label_class: 'checkbox_label_class',
            checkbox_name: 'checkbox_name',
            checkbox_placeholder: 'checkbox_placeholder',
            checkbox_checked: false,
            checkbox_onText: 'Yes',
            checkbox_offText: 'No'
        },
        tpl: tpl,
        setup: function (opt) {
            var checkboxComp = this.comp.find('input');
            checkboxComp.bootstrapSwitch({
                onText: opt.checkbox_onText,
                offText: opt.checkbox_offText
            });
            checkboxComp.on('switchChange.bootstrapSwitch', function (event, state) {
                checkboxComp.attr('checked', state);
            });
        },
    });

    return Checkbox;
});
