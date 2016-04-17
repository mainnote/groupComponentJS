define(['jquery', 'component', 'tpl!templates/navItem.html'
	], function ($, Component, tpl) {
    var NavItem = Component.create('NavItem');
    NavItem.extend({
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            navitem_click: false,
            pullright: false,
            activeOn: 'item',
            active: false,
            badge: 0,
        },
        tpl: tpl,
        setup: function (opt) {
            if (opt && opt.navitem_click) {
                var that = this;
                this.comp.on('click', function (e) {
                    if (that.opt.parent) {
                        if (typeof that.opt.parent.clearActive === 'function') that.opt.parent.clearActive();
                    }
                    that.setActive();
                    return false;
                });
            }
            if (this.opt.active) this.onActive({
                isInit: true,
                tag: this.name
            });
            return this.comp;
        },
        onActive: function (opt) {
            if (typeof this.opt.parent.onActive === 'function')
                this.opt.parent.onActive(opt);
        },
        setActive: function (opt) {
            this.setOpt({
                active: true,
            });
            this.onActive({
                isInit: false,
                tag: this.name
            });

            if (this.comp) {
                if (this.opt && this.opt.activeOn === 'item') {
                    this.comp.find('li.nav-item').addClass('active');
                }
                if (this.opt && this.opt.activeOn === 'link') {
                    this.comp.find('a.nav-link').addClass('active');
                }
            }
        },
        clearActive: function (opt) {
            this.setOpt({
                active: false,
            });

            if (this.comp) {
                if (this.opt && this.opt.activeOn === 'item') {
                    this.comp.find('li.nav-item').removeClass('active');
                }
                if (this.opt && this.opt.activeOn === 'link') {
                    this.comp.find('a.nav-link').removeClass('active');
                }
            }
        },
    });

    return NavItem;
});
