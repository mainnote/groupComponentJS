define(['jquery', 'group'
	], function ($, Grp) {
	var Data = Grp.obj.create('Data');
	Data.extend({
        value: null,
        update: function(opt) {
            this.value = opt.value;
            return this.command();
        },
        get: function(opt) {
            return this.value;
        },
	});

	return Data;
});