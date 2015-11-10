define(['jquery', 'component', 'tpl!templates/navBrand'
	], function ($, Component, tpl) {
	var NavBrand = Component.create('NavBrand');
	NavBrand.extend({
        defaultOpt: {
        },
        tpl: tpl,
	});

	return NavBrand;
});
