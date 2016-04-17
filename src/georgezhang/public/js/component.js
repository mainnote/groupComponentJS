define(['jquery', 'optObj'
	], function ($, OptObj) {
    var Component = OptObj.create('Component');
    Component.extend({
        template: function (opt) {
            return this.tpl ? this.tpl(opt) : '';
        },
        beforeRender: function (opt) {},
        render: function (opt) {
            this.setOpt(opt || {});
            this.beforeRender(this.opt);

            var opt_ = this.opt;

            if (!this.comp) {
                var comp = $(this.template(opt_));
                if (opt_.prepend) {
                    comp.prependTo(this.opt.container);
                } else {
                    comp.appendTo(this.opt.container);
                }
                this.comp = comp;
            }
            return this.opt.noSetup ? this.comp : this.setup(opt_);
        },

        setup: function (opt) {
            return this.comp;
        },
        remove: function (opt) {
            this.comp.remove();
            this.comp = null;
            this.afterRemoved(opt);
        },
        afterRemoved: function (opt) {},
        setElements: function (opt) {
            var that = this;
            if (opt.elements && $.isArray(opt.elements)) {
                for (var i = 0, len = opt.elements.length; i < len; i++) {
                    var elem = opt.elements[i];
                    var elemObj = elem.elem.create();

                    if (elemObj.hasOwnProperty('parentNames')) {
                        this.addElement({
                            elemCmd: elemObj.command(),
                            elemOpt: elem.opt,
                            container: opt.container || this.comp
                        });
                        if (!this.elements) this.elements = [];
                        this.elements.push(elemObj);
                    }
                }
            }
        },
        addElement: function (opt) {
            if (!opt.elemOpt) opt.elemOpt = {};
            opt.elemOpt.container = opt.container;
            opt.elemOpt.parent = this;
            opt.elemCmd('render', opt.elemOpt);
        }
    });

    return Component;
});
