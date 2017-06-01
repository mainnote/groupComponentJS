define(['jquery', 'collectionGrp', 'request', 'Promise'], function($, CollectionGrp, Request, Promise) {
    var CollectionRequestGrp = CollectionGrp.create('CollectionRequestGrp');
    var request = Request.create('request');
    CollectionRequestGrp.join(request);

    var collection = CollectionRequestGrp.getMember('collection');
    var collection_remove = collection.remove;
    var collection_update = collection.update;
    collection.extend({
        fetchAdd: function(opt) {
            var that = this;
            that.setOpt(opt);
            if (opt && opt.url) {
                return this.remoteGet(opt)
                    .then(function(values) {
                        var _opt = {
                            values: values
                        };

                        that.add(_opt);
                    });
                //must return promise
            } else {
                throw new TypeError('invalid URL');
            }
        },
        remove: function(opt){
            var that = this;
            if (opt && opt.entity) {
                return this.remoteRemove(opt)
                    .then(function(values) {
                        collection_remove.call(that, opt);
                    });
                //must return promise
            } else {
                throw new TypeError('invalid entity');
            }
        },
        update: function(opt) {
            var that = this;
            if (opt && opt.entity) {
                return this.remoteUpdate(opt)
                    .then(function(values) {
                        collection_update.call(that, opt);
                    });
                //must return promise
            } else {
                throw new TypeError('invalid entity');
            }
        },
        //to be overriden
        remoteGet: function(opt) {
            throw new TypeError('Method collectionRequestGrp.remoteGet(opt) must be overriden!');
            //must return Promise
        },
        //to be overriden
        remoteRemove: function(opt) {
            throw new TypeError('Method collectionRequestGrp.remoteRemove(opt) must be overriden!');
            //must return Promise
        },
        //to be overriden
        remoteUpdate: function(opt) {
            throw new TypeError('Method collectionRequestGrp.remoteUpdate(opt) must be overriden!');
            //must return Promise
        },
        //to be overriden
        remoteAdd: function(opt) {
            throw new TypeError('Method collectionRequestGrp.remoteAdd(opt) must be overriden!');
            //must return Promise
        }
    });

    return CollectionRequestGrp;
});
