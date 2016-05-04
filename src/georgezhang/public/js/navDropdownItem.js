define(['jquery', 'navItem', 'tpl!templates/navDropdownItem'
	], function ($, NavItem, tpl) {
    var NavDropdownItem = NavItem.create('NavDropdownItem');
    NavDropdownItem.extend({
        tpl: tpl,
        setup: function (opt) {
            if (opt.dropdown_items) {
                this.setElements({
                    container: this.comp.find('.dropdown-menu'),
                    elements: opt.dropdown_items
                });
            }
            return this.comp;
        },
    });

    return NavDropdownItem;
});
