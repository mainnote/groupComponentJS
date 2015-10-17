define(['jquery', 'component', 'tpl!templates/list',
	], function ($, Component, tpl) {
	var List = Component.create('List');
	List.extend({
		tpl : tpl,
		items : [],
		setup : function (opt) {
			var that = this;
			if (opt.list_data && $.isArray(opt.list_data)) {
				$.each(opt.list_data, function (index, data) {
					var itemCmd = that.group.call('Item', 'create', 'itemCmd').command(); //member create
					that.items.push(itemCmd);
					var opt_ = {
						noSetup : true,
						list : that,
						container : that.comp,
						item_data : data,
					};
					var itemComp = itemCmd('render', opt_);
					return itemComp;
				});
			}
			this.setupItems();
		},

		setupItems : function (opt) {
			$.each(this.items, function (index, itemCmd) {
				itemCmd('setup', opt);
			});
		},
	});

	return List;
});
