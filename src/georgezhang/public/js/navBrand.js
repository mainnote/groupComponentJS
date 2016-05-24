define(['jquery', 'component', 'tpl!templates/navBrand'
	], function ($, Component, tpl) {
    var NavBrand = Component.create('NavBrand');
    NavBrand.extend({
        tpl: tpl,
        defaultOpt: {
            navBrand_url: '#',
            navBrand_html: '',
            prepend: true,
        },
    });

    return NavBrand;
});
