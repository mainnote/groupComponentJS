define(['jquery', 'component', 'tpl!templates/dropdownItem'
	], function ($, Component, tpl) {
    var DropdownItem = Component.create('DropdownItem');
    DropdownItem.extend({
        tpl: tpl,
        defaultOpt: {
            dropdownItem_url: '#',
            dropdownItem_html: '',
            pullright: false,
        },
    });

    return DropdownItem;
});
