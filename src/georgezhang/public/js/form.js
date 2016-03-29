define(['jquery', 'component', 'tpl!templates/form'
	], function ($, Component, tpl) {
	var Form = Component.create('Form');
	Form.extend({
		tpl : tpl,
		setup : function (opt) {
			var that = this;
			//build fieldset from JSON
			if (opt.form_elements && $.isArray(opt.form_elements)) {
				var len = opt.form_elements.length;
				for (var i = 0; i < len; i++) {
					var elem = opt.form_elements[i];
					var comp = elem.elem.create();
					var compOpt = elem.opt;
					if (comp.hasOwnProperty('parentNames')) {
						this.add({
							compCmd : comp.command(),
							compOpt : compOpt || {},
						});
					}
				}
			}
			return this.comp;
		},
		submitting : false,
		submit : function (opt) {
			if (!this.submitting) {
				this.submitting = true;
				var action = this.comp.attr('action');
				var method = this.comp.attr('method');
				var data = this.serialize();
				$.ajax({
					type : method,
					url : action,
					data : data,
					context : this,
					done : function (data) {
						var opt_ = {
							data : data,
						};
						this.done(opt_);
					},
					always : function () {
						this.always();
					},
				});
			}
		},
		done : function (opt) {},
		always : function (opt) {
			this.submitting = false;
		},
		add : function (opt) {
			var opt_ = $.extend({
					container : this.comp.find('fieldset'),
                    form : this
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
