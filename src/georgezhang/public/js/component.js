define(['jquery', 'group'
	], function ($, Grp) {
	var Component = Grp.obj.create('Component');
	Component.extend({
		defaultOpt : {},
		template : function (opt) {
			return this.tpl ? this.tpl(opt) : '';
		},

		render : function (opt) {
			var opt_ = $.extend({}, this.defaultOpt, opt);
			var comp = $(this.template(opt_));
			comp.appendTo(opt.container);
			this.comp = comp;
			return opt.noSetup ? this.comp : this.setup(opt);
		},

		setup : function (opt) {
			return this.comp;
		},
		remove : function (opt) {
			this.comp.remove();
		},
	});

	return Component;
});
