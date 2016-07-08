define(['jquery', 'Promise'
	], function ($) {
    return {
        opt: {}, //should not be overriden
        defaultOpt: {},
        reservedAttr: ['opt', 'defaultOpt', 'init', 'setOpt', 'set', 'setAsync', 'convertPromise', 'promisable'],
        init: function () {},
        setOpt: function (opt) {
            if (opt) this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
        },
        setAsync: function () {
            if (this.promisable.length > 0) {
                var that = this;
                _.each(this.promisable, function (methodName) {
                    that[methodName + 'Async'] = that.convertPromise(methodName);
                });
            }
            return this;
        },
        convertPromise: function (methodName) {
            return function (opt) {
                var that = this;
                if (!opt) opt = {};
                return Promise.fromCallback(function (callback) {
                    opt.callback = callback;
                    return that[methodName](opt);
                });
            };
        },
    };
});
