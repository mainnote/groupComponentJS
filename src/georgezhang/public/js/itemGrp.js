define(['jquery', 'optGrp', 'item'
	], function ($, OptGrp, Item) {
	var ItemGrp = OptGrp.create('ItemGrp');
    var item = Item.create('item');

	ItemGrp.extend({
		render: function(opt){
			this.call('item', 'render', opt);
		},
	});
    ItemGrp.join(item);
	
	return ItemGrp;
});
