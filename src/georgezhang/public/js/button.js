define(['jquery', 'component', 'tpl!templates/button'], function($, Component, tpl) {
    var Button = Component.create('Button');
    Button.extend({
        tpl: tpl,
        defaultOpt: {
            button_name: 'Button',
            button_title: 'button title',
            button_type: 'button',
            button_class: 'btn-sm btn-primary'
        },
        setup: function(opt) {
            if (opt && opt.form && opt.button_type === 'submit') {
                this.comp.on('click', function(e) {
                    e.preventDefault();
                    opt.form.submit();
                });
            }
            return this.comp;
        }
    });

    return Button;
});
