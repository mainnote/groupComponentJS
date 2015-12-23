define(['jquery', 'navItem', 'tpl!templates/navDropdownItem'
	], function ($, NavItem, tpl) {
	var NavDropdownItem = NavItem.create('NavDropdownItem');
	NavDropdownItem.extend({
		tpl : tpl,
		setup : function (opt) {
			var that = this;
			if (opt.dropdown_items) {
				if ($.isArray(opt.dropdown_items)) {
					setDropdownItem(opt.dropdown_items);
				} else {
					if (window.LOG)
						LOG(TAG, 'Opt dropdown_items is not correct!', 'error');
				}
			}

			function setDropdownItem(items) {
				var len = items.length;
				var container = that.comp.find('.dropdown-menu');
				for (var i = 0; i < len; i++) {
					var item = items[i];
					item.cmd('render', $.extend({}, item.opt || {}, {
							container : container
						}));
				}
			}

			return this.comp;
		},
	});

	return NavDropdownItem;
});
