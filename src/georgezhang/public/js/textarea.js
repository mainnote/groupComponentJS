define(['jquery', 'component', 'tpl!templates/textarea', 'autosize'], function($, Component, tpl, autosize) {
    var Textarea = Component.create('Textarea');
    Textarea.extend({
        tpl: tpl,
        defaultOpt: {
            textarea_name: 'defaultTextareaName',
            textarea_value: '',
            textarea_placeholder: '',
            textarea_class: '',
            textarea_autoResize: false
        },
        setup: function(opt) {
            this.setOpt(opt);
            if (this.opt.textarea_autoResize) {
                autosize(this.comp);
            }

            return this.comp;
        },
    });

    return Textarea;
});
