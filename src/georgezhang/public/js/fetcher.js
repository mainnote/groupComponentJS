define(['jquery', 'optObj', 'scroll'
	], function ($, OptObj, Scroll) {
    var Fetcher = OptObj.create('Fetcher');
    Fetcher.extend({
        jqxhr: null,
        timeoutHandler: null,
        defaultOpt: {
            data: {},
            done: function () {},
            fail: function (err) {
                console.error(err);
            },
            always: function () {},
            dataType: 'json'
        },
        stop: function (opt) {
            if (this.jqxhr) this.jqxhr.abort();
            Scroll.remove({ obj: this });
            if (this.timeoutHandler) clearTimeout(this.timeoutHandler);
        },
        get: function (opt) {
            this.setOpt(opt);
            this.jqxhr = $.get({
                    url: this.opt.url,
                    data: this.opt.data,
                    dataType: this.opt.dataType,
                    context: this,
                })
                .done(function (result) {
                    this.opt.done(result);
                })
                .fail(function (err) {
                    this.opt.fail(err);
                })
                .always(function () {
                    this.opt.always();
                });
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
                    if (opt.pageLoading) { //we want it to match
                        this.timeoutHandler = setTimeout(fetchNext, 50); //wait 50 millisecnds then recheck
                        return;
                    }
                    if (!opt.lastPage) {
                        opt.pageLoading = true;
                        var opt_ = {
                            url: opt.getUrl(),
                            done: opt.afterNextFetch
                        }
                        that.get(opt_);
                    }
                }

                fetchNext();
            }
        }
    });

    return Fetcher;
});
