define(['jquery'
	], function ($) {
    return {
        opt: {}, //should not be overriden
        defaultOpt: {},
        reservedAttr: ['opt', 'defaultOpt', 'init', 'setOpt'],
        init: function () {},
        setOpt: function (opt) {
            if(opt) this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
        }
    };
});
