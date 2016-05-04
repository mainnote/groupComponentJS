define(['jquery', 'optObj'
	], function ($, OptObj) {
    var Collection = OptObj.create('Collection');
    Collection.extend({
        values: [],
        reset: function (opt) {
            this.values = [];
        },
        add: function (opt) {
            var that = this;

            function addValue(value) {
                var entityCmd = that.group.call('entity', 'create', 'entityCmd').command();
                var opt_ = {
                    value: value,
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
