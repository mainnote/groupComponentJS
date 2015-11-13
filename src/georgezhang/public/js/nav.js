define(['jquery', 'component', 'tpl!templates/nav'
	], function ($, Component, tpl) {
	var Nav = Component.create('Nav');
	Nav.extend({
        defaultOpt: {
            nav_id_left: 'navIDLeft',
            nav_id_right: 'navIDRight',
        },
        tpl: tpl,
        setup: function(opt){
            if (opt.nav_brand && opt.nav_brand.cmd) {
                var container = this.comp.find('div.collapse');
                opt.nav_brand.cmd('render', $.extend({}, opt.nav_brand.opt||{},{ container: container }));
            }
            
            if (opt.nav_items && $.isArray(opt.nav_items)){
                var len = opt.nav_items.length;
                var container = this.comp.find('ul.nav');
                for (var i=0; i<len; i++){
                    var item = opt.nav_items[i];
                item.cmd('render', $.extend({}, item.opt,{ container: container }));
                }
            }
        },
	});

	return Nav;
});
