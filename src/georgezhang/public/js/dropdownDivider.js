define(['jquery', 'component', 'tpl!templates/dropdownDivider'
	], function ($, Component, tpl) {
    var DropdownDivider = Component.create('DropdownDivider');
    DropdownDivider.extend({
        tpl: tpl,
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            pullright: false,
        },
    });

    return DropdownDivider;
});
