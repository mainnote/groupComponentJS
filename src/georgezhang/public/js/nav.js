define(['jquery', 'component', 'tpl!templates/nav'
	], function ($, Component, tpl) {
	var Nav = Component.create('Nav');
	Nav.extend({
        defaultOpt: {
            nav_id: 'navID',
        },
        tpl: tpl,
	});

	return Nav;
});
