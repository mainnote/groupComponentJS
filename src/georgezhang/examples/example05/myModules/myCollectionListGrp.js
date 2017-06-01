define(['jquery', 'optGrp', 'collectionRequestGrp', 'myApp/myModules/myListItemGrp', 'scroll'], function($, OptGrp, CollectionRequestGrp, MyListItemGrp, Scroll) {
    var collectionRequestGrp = CollectionRequestGrp.create('collectionRequestGrp');
    var listItemGrp = MyListItemGrp.create('listItemGrp');

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
                    var list = that.group.upCall('listItemGrp', 'getMember', 'list');
                    list.setup({
                        list_entities: newEntities,
                        prepend: true
                    });
                });
        },
    });

    var MyCollectionListGrp = OptGrp.create('MyCollectionListGrp');
    MyCollectionListGrp.join(collectionRequestGrp, listItemGrp);

    //setup layout
    MyCollectionListGrp.extend({
        set: function(opt) {
            var that = this;
            var scroll_id = 'LOAD NEXT';
            var collection = this.getMember('collection');
            var currentTop = 0;
            var $body = $('body');
            var url_index = 0;
            opt.url = opt.urls[url_index++];
            loadBatch(opt);

            function loadBatch(opt_) {
                $body.addClass('loading');
                collection.fetchAdd(opt_)
                    .then(function() {
                        that.call('listItemGrp', 'set', $.extend({}, opt_, {
                            container: opt_.container.find('#centerContent'),
                            collectionGrp: that.getMember('collectionRequestGrp')
                        }));
                        $body.removeClass('loading');
                        $(document).scrollTop(currentTop);
                    })
                    .then(function() {
                        //setup scroll trigger here
                        Scroll
                            .add({
                                obj: scroll_id,
                                fn: next.bind(this)
                            });

                        //trigger funtion for scroll
                        function next() {
                            currentTop = $(document).scrollTop();
                            if (currentTop >= ($('#go_map').position().top - $(window).height())) { //when scoll reach the end of the container
                                Scroll.remove({
                                    obj: scroll_id
                                });
                                if (opt_.urls.length > url_index) {
                                    opt_.url = opt_.urls[url_index++];
                                    loadBatch(opt_);
                                }
                            }
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                        $body.removeClass('loading');
                    });
            }
        },
    });
    return MyCollectionListGrp;
});
