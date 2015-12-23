define(['jquery', 'component', 'tpl!templates/navItem'
	], function ($, Component, tpl) {
	var NavItem = Component.create('NavItem');
	NavItem.extend({
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            pullright: false,
            active: false,
        },
        tpl: tpl,
        setActive: function (opt) {
            this.setOpt({
                active: true,
            });
        },
	});

	return NavItem;
});
