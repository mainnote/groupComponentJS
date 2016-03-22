define(['jquery', 'group', 'scroll'
	], function ($, Grp, Scroll) {
    var Fetcher = Grp.obj.create('Fetcher');
    Fetcher.extend({
        jqxhr: null,
        timeoutHandler: null,
        initOpt: {
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
            var opt_ = $.extend({}, this.initOpt, opt);
            this.jqxhr = $.get({
                    url: opt_.url,
                    data: opt_.data,
                    dataType: opt_.dataType,
                    context: this,
                })
                .done(function (result) {
                    opt_.done(result);
                })
                .fail(function (err) {
                    opt_.fail(err);
                })
                .always(function () {
                    opt_.always();
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
