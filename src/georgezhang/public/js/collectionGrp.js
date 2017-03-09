 define(['jquery', 'optGrp', 'collection', 'entity'], function($, OptGrp, Collection, Entity) {
     var CollectionGrp = OptGrp.create('CollectionGrp');
     var collection = Collection.create('collection');
     var entity = Entity.create('entity');

     CollectionGrp.join(collection, entity);

     return CollectionGrp;
 });
