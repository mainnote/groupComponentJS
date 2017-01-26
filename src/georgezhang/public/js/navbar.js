define(['jquery', 'component', 'tpl!templates/navbar'
	], function ($, Component, tpl) {
    var Navbar = Component.create('Navbar');
    Navbar.extend({
        tpl: tpl,
        defaultOpt: {
            navbar_id: 'navbar_id',
            navbar_placement: 'navbar-fixed-top navbar-light bg-faded'
        },
        setup: function (opt) {
            if (opt.navbar_brand) {
                this.setElements({
                    elements: [opt.navbar_brand]
                });
            }

            if (opt.navbar_items) {
                this.setElements({
                    container: this.comp.find('#' + this.opt.navbar_id + ' ul'),
                    elements: opt.navbar_items
                });
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
        },
        onActive: function (opt) {},
        clearActive: function (opt) {
            if (this.elements && $.isArray(this.elements))
                $.each(this.elements, function (index, elemObj) {
                    elemObj.clearActive();
                });
        }

    });

    return Navbar;
});
