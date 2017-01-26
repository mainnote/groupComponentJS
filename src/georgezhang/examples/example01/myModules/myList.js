define(['jquery', 'component', 'tpl!myApp/myTemplates/myList'
	], function ($, Component, tpl) {
    var MyList = Component.create('MyList');
    MyList.extend({
        tpl: tpl,
		addItem: function(opt) {
			var item = this.buildItem(opt);
			if (item)
				this.comp.append(item);
		},
		buildItem: function(opt) {
			if (opt.item_value)
				return '<li>' + opt.item_value.toString() + '</li>';
			else
				return null;
		},
    });

    return MyList;
});
