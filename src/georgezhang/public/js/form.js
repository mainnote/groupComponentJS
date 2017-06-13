define(['jquery', 'component', 'tpl!templates/form'], function($, Component, tpl) {
    function _v(obj, pathStr) {
        var paths = pathStr.split('.');
        var len = paths.length;
        if (len > 1) {
            var result = obj;
            for (var i = 0; i < len; i++) {
                if (result.hasOwnProperty(paths[i])) {
                    result = result[paths[i]];
                } else {
                    throw new TypeError('invalid pathStr when mapping!');
                }
            }

            return result;
        } else {
            return obj[pathStr];
        }
    }

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
            //build fieldset from opt
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
                            compOpt[key] = _v(opt.doc, keyColumnMap[key]);
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
        submit: function(opt) { //to be overriden
            throw new TypeError('Must override form.submit() method');
            /*
            if (!this.submitting && this.checkValid()) {
                this.submitting = true;
                var action = (this.opt.form_action || this.comp.attr('action'));
                var method = this.opt.form_method || this.comp.attr('method');
                var data = this.serialize();
            }
            */
        },
        checkValid: function(opt) {
            var validFlag = true;
            $.each(this.components, function(index, component) {
                if ('checkValid' in component && typeof component.checkValid == 'function') {
                    var result = component.checkValid(); //valid?
                    if (!result) validFlag = false;
                }
            });
            return validFlag;
        },
        all: function(opt) {
            $.each(this.components, function(index, component) {
                if (opt.compfn in component && typeof component[opt.compfn] == 'function') {
                    component[opt.compfn]();
                }
            });
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
            if ('_memberList' in opt.comp && typeof opt.comp.set == 'function') { //if component is a group
                opt.comp.set(opt_);
            } else { //native component
                opt.comp.render(opt_);
            }
        },
        find: function(opt) {
            var subComp;
            $.each(this.components, function(i, comp) {
                if (comp._id === opt._id) {
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
