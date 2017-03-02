define(['jquery', 'bootstrap', 'navbar', 'navBrand', 'navItem', 'navUserItem', 'navDropdownItem', 'dropdownItem', 'dropdownDivider', 'text!myApp/menu.json'], function($, bootstrap, Navbar, NavBrand, NavItem, NavUserItem, NavDropdownItem, DropdownItem, DropdownDivider, menuText) {
    var navBrand = NavBrand.create('navBrand');
    navBrand.setOpt({
        navBrand_url: '/',
        navBrand_html: 'group.js'
    });

    var menus = JSON.parse(menuText);
    var dropdown_items = [];

    function createMenuItem(item) {
        var example01 = DropdownItem.create(item.name);
        example01.setOpt({
            dropdownItem_url: item.url,
            dropdownItem_html: item.html
        });
        dropdown_items.push({
            elem: example01
        });
    }

    $.each(menus, function(i, value) {
        createMenuItem(value);
    });

    var pages = NavDropdownItem.create('pages');
    pages.setOpt({
        navItem_html: 'Examples',
        dropdown_items: dropdown_items
    });

    var navbarMenu = Navbar.create('navCmd');
    var opt = {
        container: $('#mnbody'),
        navbar_brand: {
            elem: navBrand,
        },
        navbar_items: [{
            elem: pages,
        }],
    };
    navbarMenu.render(opt);
});
