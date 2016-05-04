define(['jquery', 'component', 'tpl!templates/dropdownDivider'
	], function ($, Component, tpl) {
	var DropdownDivider = Component.create('DropdownDivider');
	DropdownDivider.extend({
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            pullright: false,
        },
        tpl: tpl,
	});

	return DropdownDivider;
});
