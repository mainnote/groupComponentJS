define(['jquery', 'Promise'], function($) {
    return {
        opt: {}, //should not be overriden
        defaultOpt: {},
        reservedAttr: ['opt', 'defaultOpt', 'init', 'setOpt', 'set'],
        init: function() {},
        setOpt: function(opt) {
            if (opt) this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
        }
    };
});
