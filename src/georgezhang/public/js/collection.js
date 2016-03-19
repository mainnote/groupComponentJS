define(['jquery', 'group'
	], function ($, Grp) {
    var Collection = Grp.obj.create('Collection');
    Collection.extend({
        values: [],
        reset: function (opt) {
            this.values = [];
        },
        add: function (opt) {
            var that = this;

            function addValue(values) {
                var entityCmd = that.group.call('Entity', 'create', 'entityCmd').command();
                var opt_ = {
                    value: values,
                };
                var v = entityCmd('update', opt_);
                that.values.push(v);
            }

            if (opt.values) {
                if ($.isArray(opt.values)) {
                    $.each(opt.values, function (index, value) {
                        addValue(value);
                    });
                } else {
                    addValue(opt.values);
                }
            }
            return this.values;
        },
        addExtra: function (opt) {
            var startIndex = this.values.length;
            this.add(opt);
            return this.values.slice(startIndex);
        }
    });

    return Collection;
});
