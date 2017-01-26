define(['jquery', 'optGrp', 'navbar', 'toggleHeaderScroll'
	], function ($, OptGrp, Navbar, ToggleHeaderScroll) {
	var NavbarGrp = OptGrp.create('NavbarGrp');
    var Navbar = Navbar.create('Navbar');
    var ToggleHeaderScroll = ToggleHeaderScroll.create('ToggleHeaderScroll');
	NavbarGrp.extend({
		render: function(opt) {
			this.call('Navbar', 'render', opt);
		},
	});
    NavbarGrp.join(Navbar, ToggleHeaderScroll);
	return NavbarGrp;
});
