define(['jquery', 'optObj', 'scroll', 'request'
	], function ($, OptObj, Scroll, Request) {
    var Fetcher = OptObj.create('Fetcher');
    Fetcher.extend({
        defaultOpt: {
            data: {},
        },
        init: function () {
            OptObj.init.call(this);
            this.requestCmd = Request.create('requestCmd').command();
        },
        /* not sure how this function work */
        stop: function (opt) {
            this.requestCmd('abort');
            Scroll.remove({
                obj: this
            });
        },
        getAsync: function (opt) {
            this.setOpt(opt);
            if (this.opt.url) {
                var opt_ = {
                    request_url: this.opt.url,
                    request_method: 'GET',
                    request_data: this.opt.data,
                };
                return this.requestCmd('connectAsync', opt_);
            } //no error if no url
        },
        setScrollEndFetch: function (opt) {
            Scroll.add({
                obj: this,
                fn: this.scrollEventFn.bind(this, opt)
            });
        },

        scrollEventFn: function () {
            var opt = arguments[0];
            var event = arguments[1];

            var that = this;
            var nearToBottom = 100; //near 100 px from bottom, better to start loading

            if ($(document).height() - nearToBottom <= $(window).scrollTop() + $(window).height()) {

                //fetch more content
                function fetchNext() {
                    if (!opt.lastPage) {
                        opt.pageLoading = true;
                        var opt_ = {
                            url: opt.getUrl(),
                        }
                        return that.getAsync(opt_)
                            .then(opt.afterNextFetch);
                    }
                }

                fetchNext();
            }
        }
    });

    return Fetcher;
});
