define(['jquery', 'group', 'dataCollection', 'data'
	], function ($, Grp, DataCollection, Data) {
	var DataCollectionGrp = Grp.group.create('DataCollectionGrp');
	var DataCollection = DataCollection.create('DataCollection');
	var Data = Data.create('Data');
	DataCollectionGrp.join(DataCollection, Data);

	DataCollectionGrp.setCallToMember('DataCollection');
	return DataCollectionGrp;
});
