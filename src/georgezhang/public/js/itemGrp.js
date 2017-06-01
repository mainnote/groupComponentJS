define(['jquery', 'optGrp', 'item'
	], function ($, OptGrp, Item) {
	var ItemGrp = OptGrp.create('ItemGrp');
    var item = Item.create('item');

	ItemGrp.extend({
		set: function(opt){
			this.call('item', 'render', opt);
		},
	});
    ItemGrp.join(item);

	return ItemGrp;
});
