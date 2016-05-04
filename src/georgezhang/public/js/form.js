define(['jquery', 'component', 'tpl!templates/form'
	], function ($, Component, tpl) {
    var Form = Component.create('Form');
    Form.extend({
        defaultOpt: {
            form_action: '/',
            form_method: 'GET'
        },
        tpl: tpl,
        setup: function (opt) {
            var that = this;
            //build fieldset from JSON
            if (opt.form_elements && $.isArray(opt.form_elements)) {
                var len = opt.form_elements.length;
                for (var i = 0; i < len; i++) {
                    var elem = opt.form_elements[i];
                    var comp = elem.elem.create();

                    var compOpt;
                    if (opt.doc && elem.opt && elem.opt.keyColumnMap) {
                        compOpt = elem.opt || {};
                        var keyColumnMap = elem.opt.keyColumnMap;
                        for (var key in keyColumnMap) {
                            compOpt[key] = opt.doc[keyColumnMap[key]];
                        }
                    } else {
                        compOpt = elem.opt;
                    }
                    if (comp.hasOwnProperty('parentNames')) {
                        this.add({
                            compCmd: comp.command(),
                            compOpt: compOpt,
                        });
                    }
                }
            }
            return this.comp;
        },
        submitting: false,
        submit: function (opt) {
            if (!this.submitting) {
                this.submitting = true;
                var id;
                if (this.opt && this.opt.doc && this.opt.doc._id) id = this.opt.doc._id;
                var action = (this.opt.form_action || this.comp.attr('action')) + id || '';
                var method = this.opt.form_method || this.comp.attr('method');
                var data = this.serialize();
                $.ajax({
                    type: method,
                    url: action,
                    data: data,
                    context: this,
                    done: function (data) {
                        var opt_ = {
                            data: data,
                        };
                        this.done(opt_);
                    },
                    always: function () {
                        this.always();
                    },
                });
            }
        },
        done: function (opt) {},
        always: function (opt) {
            this.submitting = false;
        },
        add: function (opt) {
            var opt_ = $.extend({
                container: this.comp.find('fieldset'),
                form: this
            }, opt.compOpt);
            opt.compCmd('render', opt_);
        },

        serialize: function (opt) {
            return this.comp.serialize();
        },

        serializeArray: function (opt) {
            return this.comp.serializeArray();
        },

    });

    return Form;
});
