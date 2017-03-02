 define(['jquery', 'optGrp', 'collection', 'entity', 'request', 'Promise'], function($, OptGrp, Collection, Entity, Request, Promise) {
     var CollectionGrp = OptGrp.create('CollectionGrp');
     var collection = Collection.create('collection');
     collection.extend({
         defaultOpt: {
             remote: true
         },
         connectEntityAsync: function(opt) {
             var that = this;
             this.setOpt(opt);
             if (this.defaultOpt.remote) {
                 var opt_ = {
                     request_url: opt.resourceUrl || ((this.opt.request_baseUrl || '/') + (opt.entity.value._id || '')),
                     request_method: opt.connectMethod,
                 };

                 if (opt && opt.data) {
                     opt_.request_data = opt.data;
                     opt_.request_method = 'POST';
                 }
                 return this.group.call('request', 'connectAsync', opt_)
                     .then(function(data) {
                         that.update(opt);
                         return data;
                     });

             } else {
                 if (opt.connectMethod === 'GET') {
                     return Promise.resolve(opt.entity.get());
                 } else {
                     this.update(opt);
                     return Promise.resolve();
                 }
             }
         },
         update: function(opt) {
             if (opt.connectMethod === 'DELETE' || opt.connectMethod === 'PUT') {
                 this.remove(opt);
             }
         }
     });

     var entity = Entity.create('entity');
     entity.extend({
         removeAsync: function(opt) {
             //back to collection to remove this entity
             var opt_ = {
                 connectMethod: 'DELETE',
                 entity: this,
             };

             if (opt && opt.data) opt_.data = opt.data;
             if (opt && opt.resourceUrl) opt_.resourceUrl = opt.resourceUrl;

             return this.group.call('collection', 'connectEntityAsync', opt_);

         },
         fetchAsync: function(opt) {
             var opt_ = {
                 connectMethod: 'GET',
                 entity: this,
             };
             return this.group.call('collection', 'connectEntityAsync', opt_);
         },
         errorAsync: function(opt) {
             //back to collection to remove this entity
             var opt_ = {
                 connectMethod: 'PUT',
                 entity: this,
             };
             return this.group.call('collection', 'connectEntityAsync', opt_);
         },
         postAsync: function(opt) {
             var opt_ = {
                 connectMethod: 'POST',
                 entity: this,
             };

             if (opt && opt.data) opt_.data = opt.data;
             if (opt && opt.resourceUrl) opt_.resourceUrl = opt.resourceUrl;

             return this.group.call('collection', 'connectEntityAsync', opt_);
         },
     });

     var request = Request.create('request');
     CollectionGrp.extend({
         render: function(opt) {
             this.call('collection', 'render', opt);
         },
     });

     CollectionGrp.join(collection, entity, request);

     return CollectionGrp;
 });
