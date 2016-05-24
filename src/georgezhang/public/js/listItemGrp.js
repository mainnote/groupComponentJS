define(['jquery', 'optGrp', 'list', 'itemGrp'
	], function ($, OptGrp, List, ItemGrp) {
	var ListItemGrp = OptGrp.create('ListItemGrp');
    var list = List.create('list');
    var itemGrp = ItemGrp.create('itemGrp');
    ListItemGrp.join(list, itemGrp);
    
    ListItemGrp.setCallToMember('list');
	return ListItemGrp;
});
