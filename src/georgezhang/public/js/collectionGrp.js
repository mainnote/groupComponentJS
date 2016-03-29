 define(['jquery', 'optGrp', 'collection', 'entity', 'request'
	], function ($, OptGrp, Collection, Entity, Request) {
     var CollectionGrp = OptGrp.create('CollectionGrp');
     var Collection = Collection.create();
     Collection.extend({
         connectEntity: function (opt) {
             var that = this;
             this.setOpt(opt);
             var opt_ = {
                 request_url: (this.opt.request_baseUrl || '/') + opt.entity._id,
                 request_method: opt.connectMethod,
                 request_done: function (data, textStatus, jqXHR) {
                     if (data.hasOwnProperty('error')) {
                         var opt_callback = {
                             error: data.error
                         };
                         that.opt.callback(opt_callback);
                     } else {
                         that.opt.callback(data);
                     }
                 },
                 request_fail: function (jqXHR, textStatus, errorThrown) {
                     var opt_callback = {
                         error: errorThrown
                     };
                     that.opt.callback(opt_callback);
                 },
                 request_always: function (data_jqXHR, textStatus, jqXHR_errorThrow) {
                 },
             };
             this.group.call('Request', 'connect', opt_);
         }
     });

     var Entity = Entity.create();
     Entity.extend({
         remove: function (opt) {
             //back to collection to remove this entity
             var opt_ = {
                 connectMethod: 'DELETE',
                 entity: this.value,
                 callback: function (opt_callback) {
                     opt.callback(opt_callback);
                 }
             };
             this.group.call('Collection', 'connectEntity', opt_);

         },
         fetch: function (opt) {
             var opt_ = {
                 connectMethod: 'GET',
                 entity: this.value,
                 callback: function (opt_callback) {
                     opt.callback(opt_callback);
                 }
             };
             this.group.call('Collection', 'connectEntity', opt_);

         }
     });

     var Request = Request.create();

     CollectionGrp.join(Collection, Entity, Request);

     CollectionGrp.setCallToMember('Collection');
     return CollectionGrp;
 });
