define(['jquery', 'group', 'listScrollEndFetchGrp', 'input'
	], function ($, Grp, ListScrollEndFetchGrp, Input) {
	var SearchListScrollEndFetchGrp = Grp.group.create('SearchListScrollEndFetchGrp');
	var input = Input.create('input');
	input.extend({
		checkValid : function (opt) {
			//fetch
			this.group.call('listScrollEndFetchGrp', 'reset', opt);
            
            //skip getResult as list will show result itself
		},
	});

	var listScrollEndFetchGrp = ListScrollEndFetchGrp.create('listScrollEndFetchGrp');
	SearchListScrollEndFetchGrp.join(input, listScrollEndFetchGrp);
	SearchListScrollEndFetchGrp.setCallToMember('listScrollEndFetchGrp');
    SearchListScrollEndFetchGrp.extend({
        set: function(opt) {
            this.call('input', 'render', opt);
            this.call('listScrollEndFetchGrp', 'set', opt);
        }
    });

	return SearchListScrollEndFetchGrp;
});
