define(['jquery', 'component', 'tpl!templates/form'], function($, Component, tpl) {
    var Form = Component.create('Form');
    Form.extend({
        tpl: tpl,
        defaultOpt: {
            form_action: '/',
            form_method: 'GET'
        },
        init: function() {
            Component.init.call(this);
            this.submitting = false;
            this.components = [];
        },
        setup: function(opt) {
            var that = this;
            //build fieldset from JSON
            if (opt.form_elements && $.isArray(opt.form_elements)) {
                var len = opt.form_elements.length;
                for (var i = 0; i < len; i++) {
                    var elem = opt.form_elements[i];
                    var comp = elem.elem.create();

                    var compOpt;
                    if (opt.doc && elem.opt && elem.opt.keyColumnMap) {
                        compOpt = elem.opt ? $.extend({}, elem.opt) : {};
                        var keyColumnMap = elem.opt.keyColumnMap;
                        for (var key in keyColumnMap) {
                            compOpt[key] = opt.doc[keyColumnMap[key]];
                        }
                    } else {
                        compOpt = elem.opt;
                    }
                    if (comp.hasOwnProperty('_parentIDs')) {
                        this.add({
                            comp: comp,
                            compOpt: compOpt,
                        });
                    }
                }
            }
            return this.comp;
        },
        submit: function(opt) {
            if (!this.submitting && this.checkValid()) {
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
                    done: function(data) {
                        var opt_ = {
                            data: data,
                        };
                        this.done(opt_);
                    },
                    always: function() {
                        this.always();
                    },
                });
            }
        },
        checkValid: function(opt) {
            var validFlag = true;
            $.each(this.components, function(index, cmd) {
                if ('checkValid' in cmd('thisObj')) {
                    var result = cmd('checkValid'); //valid?
                    if (!result) validFlag = false;
                }
            });
            return validFlag;
        },
        done: function(opt) {},
        always: function(opt) {
            this.submitting = false;
        },
        add: function(opt) {
            this.components.push(opt.comp);
            var opt_ = $.extend({
                container: this.comp.find('fieldset'),
                form: this
            }, opt.compOpt);
            opt.comp.render(opt_);
        },
        find: function(opt) {
            var subComp;
            $.each(this.components, function(i, comp) {
                if (comp.name === opt.name) {
                    subComp = comp;
                    return false;
                }
            });
            return subComp;
        },
        serialize: function(opt) {
            return this.comp.serialize();
        },

        serializeArray: function(opt) {
            return this.comp.serializeArray();
        },

    });

    return Form;
});
