define(['jquery', 'component', 'tpl!templates/input.html'
	], function ($, Component, tpl) {
    var Input = Component.create('Input');
    Input.extend({
        tpl: tpl,
        inputElem: null,
        defaultOpt: {
            input_required: false,
            input_autofocus: false,
            input_action: false,
            input_value: '',
            input_id: 'input_id',
            input_name: 'input_name',
            input_type: 'text',
            input_placeholder: '',
            input_timeout: 700,
            input_label_class: 'input_label' //sr-only to hide it
        },
        setup: function (opt) {
            var that = this;
            this.inputElem = this.comp.find('input');
            if (this.inputElem) {
                var wait;
                this.inputElem.on('input', function (e) {
                    if (wait) {
                        clearTimeout(wait);
                        wait = null;
                    }
                    wait = setTimeout(function () {
                        that.checkValid({
                            input_value: that.inputElem.val()
                        });
                    }, opt.input_timeout);
                });
            }
        },
        checkValid: function (opt) { //to be overriden
            this.getResult({
                invalidHints: false
            });
        },
        getResult: function (opt) {
            var hints = this.comp.find('.hints');
            if (opt && opt.invalidHints) {
                this.comp.removeClass('has-success').addClass('has-warning');
                if (this.inputElem) this.inputElem
                    .removeClass('form-control-success')
                    .addClass('form-control-warning');
                hints.html(opt.invalidHints);
            } else {
                this.comp.removeClass('has-warning').addClass('has-success');
                if (this.inputElem) this.inputElem
                    .removeClass('form-control-warning')
                    .addClass('form-control-success');
                hints.html('');
            }
        },
    });

    return Input;
});
