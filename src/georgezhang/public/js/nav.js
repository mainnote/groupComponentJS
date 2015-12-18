define(['jquery', 'component', 'tpl!templates/nav'
	], function ($, Component, tpl) {
    var TAG = 'navjs';
	var Nav = Component.create('Nav');
	Nav.extend({
        defaultOpt: {
            nav_id: 'nav_id',
            nav_id_left: 'nav_id_left',
            nav_id_right: 'nav_id_right',
        },
        tpl: tpl,
        setup: function(opt){
            var that = this;
            if (opt.nav_brand && opt.nav_brand.cmd) {
                var container = this.comp.find('#' + opt.nav_id_left + ' ul');
                opt.nav_brand.cmd('render', $.extend({}, opt.nav_brand.opt||{}, { container: container }));
            } else { if (window.LOG) LOG(TAG, 'Opt nav_brand is not correct!', 'error'); }
            
            if (opt.nav_items_left){
                if ($.isArray(opt.nav_items_left)) {
                    setNavItem(opt.nav_items_left, opt.nav_id_left);
                }
                else { if (window.LOG) LOG(TAG, 'Opt nav_items_left is not correct!', 'error'); }
            }
            
            if (opt.nav_items_right){
                if ($.isArray(opt.nav_items_right)) {
                    setNavItem(opt.nav_items_right, opt.nav_id_right);
                }
                else { if (window.LOG) LOG(TAG, 'Opt nav_items_right is not correct!', 'error'); }
            }
            
            function setNavItem(items, navId){
                var len = items.length;
                var container = that.comp.find('#' + navId + ' ul');
                for (var i=0; i<len; i++){
                    var item = items[i];
                    item.cmd('render', $.extend({}, item.opt||{}, { container: container }));
                }
            }
            
            return this.comp;
        },
	});

	return Nav;
});
