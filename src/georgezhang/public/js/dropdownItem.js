define(['jquery', 'component', 'tpl!templates/dropdownItem'
	], function ($, Component, tpl) {
	var DropdownItem = Component.create('DropdownItem');
	DropdownItem.extend({
        defaultOpt: {
            dropdownItem_url: '#',
            dropdownItem_html: '',
            pullright: false,
        },
        tpl: tpl,
	});

	return DropdownItem;
});
