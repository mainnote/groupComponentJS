define(['jquery', 'optGrp', 'list', 'item'
	], function ($, OptGrp, List, Item) {
	var ListItemGrp = OptGrp.create('ListItemGrp');
    var List = List.create('List');
    var Item = Item.create('Item');
    ListItemGrp.join(List, Item);
    
    ListItemGrp.setCallToMember('List');
	return ListItemGrp;
});
