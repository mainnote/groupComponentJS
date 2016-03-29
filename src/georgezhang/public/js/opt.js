define(['jquery'
	], function ($) {
    return {
        defaultOpt: {},
        opt: {},
        setOpt: function (opt) {
            this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
        }
    };
});
