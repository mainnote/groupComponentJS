define(['jquery', 'component', 'tpl!templates/form'
	], function ($, Component, tpl) {
	var Form = Component.create('Form');
	Form.extend({
		tpl : tpl,
		setup : function (opt) {
			var that = this;
			if (opt.form_elements && $.isArray(opt.form_elements)) {
				var len = opt.form_elements.length;
				for (var i = 0; i < len; i++) {
					var comp = opt.form_elements[i];
                    var compOpt = comp.opt;
					if (!comp.hasOwnProperty('parentNames') || comp.parentNames.indexOf('Component') === -1) {
						var Comp = require(comp.elem);
						comp = Comp.create(comp.name);
					}
					this.add({
						compCmd : comp.command(),
                        compOpt: compOpt||{},
					});
				}
			}
			return this.comp;
		},

		add : function (opt) {
			var opt_ = $.extend({
				container : this.comp,
			}, opt.compOpt);
			opt.compCmd('render', opt_);
		},

		serialize : function (opt) {
            return this.comp.serialize();
        },

		serializeArray : function (opt) {
            return this.comp.serializeArray();
        },
	});

	return Form;
});
