define(['jquery', 'navDropdownItem', 'tpl!templates/navUserItem.html'
	], function ($, NavDropdownItem, tpl) {
	var NavUserItem = NavDropdownItem.create('NavUserItem');
	NavUserItem.extend({
        defaultOpt: $.extend({}, NavDropdownItem.defaultOpt, {
            navUserItem_user: null,
            navUserItem_signinUrl:'/login',
            navUserItem_signText:'Login',
            navUserItem_signupUrl: '/signup',
            navUserItem_signupText: 'Signup'
        }),
        tpl: tpl,
        setup: function(opt) {
            if (opt.navUserItem_user) {
                return NavDropdownItem.setup.call(this, opt);
            }
            
            return this.comp;
        }
	});

	return NavUserItem;
});

