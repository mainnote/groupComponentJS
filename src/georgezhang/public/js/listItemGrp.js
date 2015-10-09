define(['jquery', 'group', 'list', 'item'
	], function ($, Grp, List, Item) {
	var ListItemGrp = Grp.group.create('ListItemGrp');
    var List = List.create('List');
    var Item = Item.create('Item');
    ListItemGrp.join(List, Item);
    
	ListItemGrp.extend({
        render: function(opt) {
            var listComp = this.call('List', 'render', opt);
            return listComp;
        },
	});

	return ListItemGrp;
});
