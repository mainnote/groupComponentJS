define(['jquery'
	], function ($) {
    return {
        initValues: function () {
            this.defaultOpt = {};
            this.opt = {};
        },
        setOpt: function (opt) {
            this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
        }
    };
});
