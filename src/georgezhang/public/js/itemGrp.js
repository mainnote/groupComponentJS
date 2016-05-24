define(['jquery', 'optGrp', 'item'
	], function ($, OptGrp, Item) {
	var ItemGrp = OptGrp.create('ItemGrp');
    var item = Item.create('item');
    ItemGrp.join(item);
    
    ItemGrp.setCallToMember('item');
	return ItemGrp;
});
