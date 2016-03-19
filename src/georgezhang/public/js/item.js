define(['jquery', 'component', 'tpl!templates/item'
	], function ($, Component, tpl) {
	var Item = Component.create('Item');
	Item.extend({
        tpl: tpl,
        entityCmd: null,
        list: null,
        render: function(opt) {
            this.entityCmd = opt.item_data;
            this.list = opt.list;
            var opt_ = {
                    container: opt.container,
                    noSetup: opt.noSetup,
                    item_value: this.entityCmd('get'),
                };
            return Component.render.call(this, opt_);
        },
	});
    
    return Item;
});
