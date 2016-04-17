define(['jquery', 'component', 'tpl!templates/alert.html'
	], function ($, Component, tpl) {
	var Item = Component.create('Item');
	Item.extend({
        tpl: tpl,
	});
    
    return Item;
});
