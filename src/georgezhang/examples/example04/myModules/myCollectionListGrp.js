define(['jquery', 'optGrp', 'collectionRequestGrp', 'myApp/myModules/myListItemGrp'], function($, OptGrp, CollectionRequestGrp, MyListItemGrp) {
    var collectionRequestGrp = CollectionRequestGrp.create('collectionRequestGrp');

    var collection = collectionRequestGrp.getMember('collection');
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
                    if (res){
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
                    if (res){
                        return res;
                    } else {
                        throw new TypeError('invalid Response');
                    }

                });
        },
    });


    var listItemGrp_left = MyListItemGrp.create('listItemGrp_left');
    var listItemGrp_right = MyListItemGrp.create('listItemGrp_right');

    var MyCollectionListGrp = OptGrp.create('MyCollectionListGrp');
    MyCollectionListGrp.join(collectionRequestGrp, listItemGrp_left, listItemGrp_right);

    //setup layout
    MyCollectionListGrp.extend({
        set: function(opt) {
            var that = this;
            var collection = this.getMember('collection');
            collection.add(opt)
                .then(function() {
                    that.call('listItemGrp_left', 'set', $.extend({}, opt, {
                        container: opt.container.find('#leftSide'),
                        collectionGrp: that.getMember('collectionRequestGrp')
                    }));
                    that.call('listItemGrp_right', 'set', $.extend({}, opt, {
                        container: opt.container.find('#rightSide'),
                        collectionGrp: that.getMember('collectionRequestGrp')
                    }));
                })
                .catch(function(err){
                    console.log(err);
                });
        },
    });
    return MyCollectionListGrp;
});
