define(['jquery', 'component', 'tpl!templates/alert'
	], function ($, Component, tpl) {
    var Item = Component.create('Item');
    Item.extend({
        tpl: tpl
    });

    return Item;
});
