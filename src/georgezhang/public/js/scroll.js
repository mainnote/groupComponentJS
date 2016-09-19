/*
    scroll : Since scroll event doesn't bubble up, we need one static object to handle all events for one element like window.
*/
define(['jquery', 'optObj'], function ($, OptObj) {
    var Scroll = OptObj.create('Scroll');
    Scroll.extend({
        disableScroll: function (opt) {
            this.current = $(window).scrollTop();
            $(window).scrollTop(0);
            
            /*
            $('html, body').css({
                'overflow': 'hidden',
                'height': '100%'
            });
            $('html, body').on('mousewheel', function () {
                return false;
            });
            */
        },
        enableScroll: function (opt) {
            /*
            $('html, body').css({
                'overflow': '',
                'height': ''
            });
            */
            if (this.current) $(window).scrollTop(this.current);
            /* $('html, body').off('mousewheel'); */
        },
        set: function (opt) {
            var that = this;
            $(window).on('scroll', function (event) {
                that.triggerEvents(event);
            });
        },
        add: function (opt) {
            //if set, skip
            if (!this.isSet) {
                this.set();
                this.isSet = true;
            }
            //add to events array
            if (!(this.events && $.isArray(this.events) && this.events.length > 0)) {
                this.events = [];
            }
            if (opt && opt.fn && $.isFunction(opt.fn)) {
                this.events.push({
                    obj: opt.obj,
                    fn: opt.fn
                });
            }

        },

        remove: function (opt) {
            if (this.events && $.isArray(this.events) && this.events.length > 0 && opt && opt.obj) {
                var len = this.events.length;
                for (var i = 0; i < len; i++) {
                    var eventObj = this.events[i];
                    if (eventObj && eventObj.obj && opt.obj && eventObj.obj === opt.obj) {
                        this.events.splice(i, 1);
                    }
                }
            }
        },

        triggerEvents: function (event) {
            if (this.events && $.isArray(this.events) && this.events.length > 0) {
                for (var i = 0, len = this.events.length; i < len; i++) {
                    var eventObj = this.events[i];
                    eventObj.fn(event);
                }
            }
        }
    });

    return Scroll;
});
