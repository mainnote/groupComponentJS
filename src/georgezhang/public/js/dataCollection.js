define(['jquery', 'group'
	], function ($, Grp) {
	var DataCollection = Grp.obj.create('DataCollection');
	DataCollection.extend({
        values: [],
		add : function (opt) {
            var that = this;
			if (opt.values) {
				if ($.isArray(opt.values)) {
                    $.each(opt.values, function(index, value){
                        var dataCmd = that.group.call('Data', 'create', 'dataCmd').command();
                        var opt_ = {
                            value: value,
                        };
                        var v = dataCmd('update', opt_);
                        that.values.push(v);
                    });
                } else {
                    var dataCmd = Data.create('dataCmd');
                    var opt_ = {
                        value: opt.values,
                    };
                    var v = dataCmd('update', opt_);
                    that.values.push(v);
                }
			}
            return this.values;
		},

	});

	return DataCollection;
});
