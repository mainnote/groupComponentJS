define(['jquery', 'group', 'collection', 'entity'
	], function ($, Grp, Collection, Entity) {
	var CollectionGrp = Grp.group.create('CollectionGrp');
	var Collection = Collection.create('Collection');
	var Entity = Entity.create('Entity');
	CollectionGrp.join(Collection, Entity);

	CollectionGrp.setCallToMember('Collection');
	return CollectionGrp;
});
