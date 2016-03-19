define(['jquery', 'component', 'tpl!templates/navbar'
	], function ($, Component, tpl) {
    var TAG = 'navjs';
    var Navbar = Component.create('Navbar');
    Navbar.extend({
        defaultOpt: {
            navbar_id: 'navbar_id',
            navbar_placement: 'navbar-fixed-top navbar-light bg-faded'
        },
        tpl: tpl,
        setup: function (opt) {
            var that = this;
            if (opt.navbar_brand && opt.navbar_brand.cmd) {
                var container = this.comp;
                opt.navbar_brand.cmd('render', $.extend({}, opt.navbar_brand.opt || {}, {
                    container: container
                }));
            } else {
                if (window.LOG) LOG(TAG, 'Opt navbar_brand is not correct!', 'error');
            }

            if (opt.navbar_items) {
                if ($.isArray(opt.navbar_items)) {
                    setNavItem(opt.navbar_items, opt.navbar_id);
                } else {
                    if (window.LOG) LOG(TAG, 'Opt navbar_items is not correct!', 'error');
                }
            }

            function setNavItem(items, navId) {
                var len = items.length;
                var container = that.comp.find('#' + navId + ' ul');
                for (var i = 0; i < len; i++) {
                    var item = items[i];
                    item.cmd('render', $.extend({}, item.opt || {}, {
                        container: container
                    }));
                }
            }

            //scoll
            if (opt && opt.toggleScoll) {
                this.toggleScoll(opt);
            }

            return this.comp;
        },

        toggleScoll: function (opt) {
            if (this.group) {
                //scroll down hide nav, up show
                var opt_ = $.extend({}, opt, {
                    header: this.comp
                });
                this.group.call('ToggleHeaderScroll', 'setToggleHeaderScroll', opt_);
            }
        }

    });

    return Navbar;
});
