 define(['jquery', 'optGrp', 'collection', 'entity', 'request'
	], function ($, OptGrp, Collection, Entity, Request) {
     var CollectionGrp = OptGrp.create('CollectionGrp');
     var collection = Collection.create('collection');
     collection.extend({
         defaultOpt: {
             remote: true
         },
         connectEntity: function (opt) {
             var that = this;
             this.setOpt(opt);
             if (this.defaultOpt.remote) {
                 var opt_ = {
                     request_url: (this.opt.request_baseUrl || '/') + (opt.entity.value._id || ''),
                     request_method: opt.connectMethod,
                     request_done: function (data, textStatus, jqXHR) {
                         if (data.hasOwnProperty('error')) {
                             var opt_callback = {
                                 error: data.error
                             };
                             opt.callback(opt_callback);
                         } else {
                             that.update(opt);
                             opt.callback(data);
                         }
                     },
                     request_fail: function (jqXHR, textStatus, errorThrown) {
                         var opt_callback = {
                             error: errorThrown
                         };
                         opt.callback(opt_callback);
                     },
                     request_always: function (data_jqXHR, textStatus, jqXHR_errorThrow) {},
                 };

                 if (opt.data) {
                     opt_.request_data = opt.data;
                     opt_.request_method = 'POST';
                 }
                 this.group.call('request', 'connect', opt_);

             } else {
                 if (opt.connectMethod === 'GET') {
                     opt.callback(opt.entity.get());
                 } else {
                     this.update(opt);
                     opt.callback();
                 }
             }
         },
         update: function (opt) {
             if (opt.connectMethod === 'DELETE' || opt.connectMethod === 'PUT') {
                 this.remove(opt);
             }
         }
     });

     var entity = Entity.create('entity');
     entity.extend({
         remove: function (opt) {
             //back to collection to remove this entity
             var opt_ = {
                 connectMethod: 'DELETE',
                 entity: this,
                 data: opt.data,
                 callback: opt.callback
             };
             this.group.call('collection', 'connectEntity', opt_);

         },
         fetch: function (opt) {
             var opt_ = {
                 connectMethod: 'GET',
                 entity: this,
                 callback: opt.callback
             };
             this.group.call('collection', 'connectEntity', opt_);
         },
         error: function (opt) {
             //back to collection to remove this entity
             var opt_ = {
                 connectMethod: 'PUT',
                 entity: this,
                 callback: opt.callback
             };
             this.group.call('collection', 'connectEntity', opt_);
         },
     });

     var request = Request.create('request');

     CollectionGrp.join(collection, entity, request);

     CollectionGrp.setCallToMember('collection');
     return CollectionGrp;
 });
