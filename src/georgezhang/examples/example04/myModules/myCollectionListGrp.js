define(['jquery', 'optGrp', 'collectionRequestGrp', 'myApp/myModules/myListItemGrp', 'myApp/myModules/myAddItemGrp'], function($, OptGrp, CollectionRequestGrp, MyListItemGrp, MyAddItemGrp) {
    var collectionRequestGrp = CollectionRequestGrp.create('collectionRequestGrp');
    var listItemGrp_left = MyListItemGrp.create('listItemGrp_left');
    var listItemGrp_right = MyListItemGrp.create('listItemGrp_right');
    var myAddItemGrp = MyAddItemGrp.create('myAddItemGrp');

    var collection = collectionRequestGrp.getMember('collection');
    var collection_addExtra = collection.addExtra;
    collection.extend({
        remoteGet: function(opt) {
            return this.group.call('request', 'getJSON', {
                    url: opt.url
                })
                .then(function(res) {
                    if (res && res.items && $.isArray(res.items)) {
                        return res.items;
                    } else {
                        throw new TypeError('invalid Response');
                    }

                });
        },
        remoteRemove: function(opt) {
            var that = this;
            return that.group.call('request', 'connect', {
                    request_url: that.opt.entity_url + '?videoId=' + opt.entity.get().id.videoId,
                    request_method: 'delete'
                })
                .then(function(res) {
                    if (res) {
                        return res;
                    } else {
                        throw new TypeError('invalid Response');
                    }

                });
        },
        remoteUpdate: function(opt) {
            var that = this;
            return that.group.call('request', 'connect', {
                    request_url: that.opt.entity_url + '?videoId=' + opt.entity.get().id.videoId,
                    request_method: 'put'
                })
                .then(function(res) {
                    if (res) {
                        return res;
                    } else {
                        throw new TypeError('invalid Response');
                    }

                });
        },
        remoteAdd: function(opt) {
            var that = this;
            return that.group.call('request', 'connect', {
                    request_url: that.opt.entity_url,
                    request_method: 'post'
                })
                .then(function(res) {
                    if (res) {
                        return res;
                    } else {
                        throw new TypeError('invalid Response');
                    }

                });
        },
        addExtra: function(opt) {
            //after remoteAdd and get the value back to fill the new item
            var that = this;

            return that.remoteAdd(opt)
                .then(function(res) {
                    var newEntities = collection_addExtra.call(that, opt); //it is an array of new entities
                    var list_left = that.group.upCall('listItemGrp_left', 'getMember', 'list');
                    var list_right = that.group.upCall('listItemGrp_right', 'getMember', 'list');
                    list_left.setup({
                        list_entities: newEntities,
                        prepend: true
                    });
                    list_right.setup({
                        list_entities: newEntities,
                        prepend: true
                    });
                });
        },
    });

    var MyCollectionListGrp = OptGrp.create('MyCollectionListGrp');
    MyCollectionListGrp.join(collectionRequestGrp, listItemGrp_left, listItemGrp_right, myAddItemGrp);

    //setup layout
    MyCollectionListGrp.extend({
        set: function(opt) {
            var that = this;
            var collection = this.getMember('collection');
            collection.fetchAdd(opt)
                .then(function() {
                    that.call('listItemGrp_left', 'set', $.extend({}, opt, {
                        container: opt.container.find('#leftSide'),
                        collectionGrp: that.getMember('collectionRequestGrp')
                    }));
                    that.call('listItemGrp_right', 'set', $.extend({}, opt, {
                        container: opt.container.find('#rightSide'),
                        collectionGrp: that.getMember('collectionRequestGrp')
                    }));
                    that.call('myAddItemGrp', 'set', $.extend({
                        button_name: 'Add new item',
                        button_class: 'btn-sm btn-primary button_add'
                    }, opt));
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
    });
    return MyCollectionListGrp;
});
