define(['jquery', 'optObj'
	], function ($, OptObj) {
    var Collection = OptObj.create('Collection');
    Collection.extend({
        init: function () {
            OptObj.init.call(this);
            this.values = [];
        },
        reset: function (opt) {
            this.values = [];
        },
        add: function (opt) {
            var that = this;

            function addValue(value) {
                var entity = that.group.call('entity', 'create', 'entity');
                var opt_ = {
                    value: value,
                };
                var v = entity.update(opt_);
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
        },
        getValues: function (opt) {
            return $.map(this.values, function (entity, i) {
                return entity.get();
            });
        },
        remove: function (opt) {
            var values = this.values;
            $.each(values, function (i, entity) {
                if (entity === opt.entity) {
                    values.splice(i, 1);
                    return false;
                }
            });
        }
    });

    return Collection;
});
