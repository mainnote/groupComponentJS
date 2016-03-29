define(['jquery', 'optGrp', 'navbar', 'toggleHeaderScroll'
	], function ($, OptGrp, Navbar, ToggleHeaderScroll) {
	var NavbarGrp = OptGrp.create('NavbarGrp');
    var Navbar = Navbar.create('Navbar');
    var ToggleHeaderScroll = ToggleHeaderScroll.create('ToggleHeaderScroll');
    NavbarGrp.join(Navbar, ToggleHeaderScroll);
    
    NavbarGrp.setCallToMember('Navbar');
	return NavbarGrp;
});
