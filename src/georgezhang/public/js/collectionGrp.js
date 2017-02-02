 define(['jquery', 'optGrp', 'collection', 'entity'
	], function ($, OptGrp, Collection, Entity) {
     var CollectionGrp = OptGrp.create('CollectionGrp');
     var collection = Collection.create('collection');
     var entity = Entity.create('entity');

     CollectionGrp.join(collection, entity);
     CollectionGrp.extend({
         add: function(opt) {
            return this.call('collection', 'add', opt); //values
         },
         getEntities: function(opt) {
             return this.call('collection', 'getEntities', opt);
         }
     });

     return CollectionGrp;
 });
