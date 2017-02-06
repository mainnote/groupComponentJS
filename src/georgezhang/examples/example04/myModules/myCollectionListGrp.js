define(['jquery', 'optGrp', 'collectionGrp', 'myApp/myModules/myListItemGrp'], function($, OptGrp, CollectionGrp, MyListItemGrp) {
    var collectionGrp = CollectionGrp.create('collectionGrp');
    var listItemGrp_left = MyListItemGrp.create('listItemGrp_left');
    var listItemGrp_right = MyListItemGrp.create('listItemGrp_right');

    var MyCollectionListGrp = OptGrp.create('MyCollectionListGrp');
    MyCollectionListGrp.join(collectionGrp, listItemGrp_left, listItemGrp_right);

    //setup layout
    MyCollectionListGrp.extend({
        setup: function(opt) {
            this.call('collectionGrp', 'add', opt);
            this.call('listItemGrp_left', 'render', $.extend({},opt, {
                container: opt.container.find('#leftSide'),
                collection: this.getMember('collectionGrp')
            }));
            this.call('listItemGrp_right', 'render', $.extend({},opt, {
                container: opt.container.find('#rightSide'),
                collection: this.getMember('collectionGrp')
            }));
        },
    });

    return MyCollectionListGrp;
});
