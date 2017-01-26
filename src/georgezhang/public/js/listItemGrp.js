define(['jquery', 'optGrp', 'list', 'itemGrp'
	], function ($, OptGrp, List, ItemGrp) {
	var ListItemGrp = OptGrp.create('ListItemGrp');
    var list = List.create('list');
    var itemGrp = ItemGrp.create('itemGrp');
	ListItemGrp.extend({
		render: function(opt) {
			this.call('list', 'render', opt);
		},
	});

    ListItemGrp.join(list, itemGrp);
	return ListItemGrp;
});
