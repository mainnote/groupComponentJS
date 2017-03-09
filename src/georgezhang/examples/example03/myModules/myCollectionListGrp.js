define(['jquery', 'optGrp', 'collectionGrp', 'myApp/myModules/myListItemGrp', 'myApp/myModules/myAddItemGrp'], function($, OptGrp, CollectionGrp, MyListItemGrp, MyAddItemGrp) {
    var collectionGrp = CollectionGrp.create('collectionGrp');
    var listItemGrp_left = MyListItemGrp.create('listItemGrp_left');
    var listItemGrp_right = MyListItemGrp.create('listItemGrp_right');
    var myAddItemGrp = MyAddItemGrp.create('myAddItemGrp');

    var MyCollectionListGrp = OptGrp.create('MyCollectionListGrp');
    MyCollectionListGrp.join(collectionGrp, listItemGrp_left, listItemGrp_right, myAddItemGrp);

    var collection = collectionGrp.getMember('collection');
    var collection_addExtra = collection.addExtra;
    collection.extend({
        addExtra: function(opt) {
            var newEntities = collection_addExtra.call(this, opt); //it is an array of new entities
            var list_left = this.group.upCall('listItemGrp_left', 'getMember', 'list');
            var list_right = this.group.upCall('listItemGrp_right', 'getMember', 'list');
            list_left.setup({
                list_entities: newEntities
            });
            list_right.setup({
                list_entities: newEntities
            });
        },
    });

    //setup layout
    MyCollectionListGrp.extend({
        set: function(opt) {
            var collection = this.getMember('collection');
            collection.add(opt);
            this.call('listItemGrp_left', 'set', $.extend({},opt, {
                container: opt.container.find('#leftSide'),
                collectionGrp: this.getMember('collectionGrp')
            }));
            this.call('listItemGrp_right', 'set', $.extend({},opt, {
                container: opt.container.find('#rightSide'),
                collectionGrp: this.getMember('collectionGrp')
            }));
            this.call('myAddItemGrp', 'set', $.extend({
                button_name: 'Add new item',
                button_class: 'btn-sm btn-primary button_add'
            },opt));
        },
    });

    return MyCollectionListGrp;
});
