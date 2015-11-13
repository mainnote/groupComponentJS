define(['jquery', 'component', 'tpl!templates/navItem'
	], function ($, Component, tpl) {
	var NavItem = Component.create('NavItem');
	NavItem.extend({
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            pullright: false,
        },
        tpl: tpl,
	});

	return NavItem;
});
