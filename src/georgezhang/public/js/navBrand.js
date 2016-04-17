define(['jquery', 'component', 'tpl!templates/navBrand.html'
	], function ($, Component, tpl) {
	var NavBrand = Component.create('NavBrand');
	NavBrand.extend({
        defaultOpt: {
            navBrand_url: '#',
            navBrand_html: '',
            prepend: true,
        },
        tpl: tpl,
	});

	return NavBrand;
});
