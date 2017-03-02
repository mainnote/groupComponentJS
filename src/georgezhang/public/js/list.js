define(['jquery', 'component', 'tpl!templates/list', ], function($, Component, tpl) {
    var List = Component.create('List');
    List.extend({
        tpl: tpl,
        init: function() {
            Component.init.call(this);
            this.collection = null;
            this.items = [];
        },
        reset: function(opt) {
            //make the original frame firm by setting min-height and width
            if (this.comp && this.comp.css) {
                this.comp.css({
                    'min-height': this.comp.css('height'),
                    'min-width': this.comp.css('width')
                });
                this.comp.empty();
            }

            this.items = [];
        },
        setup: function(opt) {
            var that = this;
            this.collection = opt.collection;

            var list_entities;
            //direct from opt
            if (opt.list_entities) {
                list_entities = opt.list_entities;
            } else {
                list_entities = opt.collection.getEntities();
            }

            if (list_entities && $.isArray(list_entities) && list_entities.length > 0) {
                $.each(list_entities, function(index, data) {
                    var itemGrp = that.group.call('itemGrp', 'create', 'itemGrp'); //member create
                    that.items.push(itemGrp);
                    var opt_ = {
                        list: that,
                        container: that.comp,
                        item_entity: data,
                    };
                    var itemComp = itemGrp.render(opt_);
                    return itemComp;
                });

                //remove fixed css value so that less blank under the list
                var minH = this.comp.css('min-height');
                var winH = $(window).height() / 2;
                this.comp.css({
                    'min-height': minH > winH ? winH : minH,
                    'min-width': ''
                });
            } else {
                this.showEmptyList(opt);
            }

            return this.comp;
        },
        removeItem: function(opt) {
            var items = this.items;
            $.each(items, function(i, itemObj) {
                if (itemObj === opt.itemObj) {
                    items.splice(i, 1);
                    return false;
                }
            });
        },
        showEmptyList: function(opt) {},
    });

    return List;
});
