define(['jquery'
	], function ($) {
    return {
        opt: {}, //should not be overriden
        defaultOpt: {},
        init: function () {},
        setOpt: function (opt) {
            this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
        }
    };
});
