define(['jquery', 'component', 'validator', 'tpl!templates/input'], function($, Component, validator, tpl) {
    var Input = Component.create('Input');
    Input.extend({
        tpl: tpl,
        validator: validator,
        defaultOpt: {
            input_required: false,
            input_autofocus: false,
            input_action: false,
            input_value: '',
            input_id: 'input_id',
            input_name: 'input_name',
            input_class: '',
            input_type: 'text',
            input_label: '',
            input_placeholder: '',
            input_timeout: 700,
            input_label_class: 'input_label', //sr-only to hide it
        },
        init: function() {
            Component.init.call(this);
            this.inputElem = null;
        },
        setup: function(opt) {
            var that = this;
            this.inputElem = this.comp.find('input');

            //automatically check if input is valid or not
            if (this.inputElem && opt.input_type.toLowerCase() !== 'hidden') {
                var wait;
                this.inputElem.on('input', function(e) {
                    if (wait) {
                        clearTimeout(wait);
                        wait = null;
                    }
                    wait = setTimeout(function() {
                        that.checkValid();
                    }, opt.input_timeout);
                });
            }

            if (opt.input_type.toLowerCase() === 'hidden') this.comp.hide();
            return this.comp;
        },
        checkValid: function(opt) { //to be overriden
            /*            var input_value = this.inputElem.val();
                        if (this.validator.isEmail(input_value)) {
                            this.getResult({
                                invalidHints: false
                            });
                            return true;
                        } else {
                            this.getResult({
                                invalidHints: 'invalid email'
                            });
                            return false;

                        }*/
            return true; //to be removed
        },
        getResult: function(opt) {
            if (this && this.comp) {
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
            }
        },
    });

    return Input;
});
