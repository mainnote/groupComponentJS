define(['jquery', 'group', 'navbar', 'toggleHeaderScroll'
	], function ($, Grp, Navbar, ToggleHeaderScroll) {
	var NavbarGrp = Grp.group.create('NavbarGrp');
    var Navbar = Navbar.create('Navbar');
    var ToggleHeaderScroll = ToggleHeaderScroll.create('ToggleHeaderScroll');
    NavbarGrp.join(Navbar, ToggleHeaderScroll);
    
    NavbarGrp.setCallToMember('Navbar');
	return NavbarGrp;
});
