define(['jquery', 'group'
	], function ($, Grp) {
    var TAG = 'componentjs';
	var Component = Grp.obj.create('Component');
	Component.extend({
		defaultOpt : {},
        opt : {},
		template : function (opt) {
			return this.tpl ? this.tpl(opt) : '';
		},

		render : function (opt) {
            if (!opt) opt = {};
			var opt_ = $.extend({}, this.defaultOpt, this.opt, opt);
			var comp = $(this.template(opt_));
            if (opt_.prepend) {
                comp.prependTo(opt.container);
            } else {
                comp.appendTo(opt.container);
            }
			this.comp = comp;
            if (window.LOG) {
                LOG(TAG, opt.container, '$');
                LOG(TAG, this.comp.prop('outerHTML'));
            }
			return opt.noSetup ? this.comp : this.setup(opt_);
		},

		setup : function (opt) {
			return this.comp;
		},
		remove : function (opt) {
			this.comp.remove();
		},
        setOpt: function(opt){
            this.opt = $.extend({}, this.opt, opt);
        },
	});

	return Component;
});
