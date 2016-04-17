define(['jquery', 'optObj'
	], function ($, OptObj) {
    var Entity = OptObj.create('Entity');
    Entity.extend({
        value: null,
        update: function (opt) {
            if (opt.hasOwnProperty('value')) {
                if ($.isPlainObject(opt.value)) {
                    this.value = $.extend({}, this.value || {}, opt.value);
                } else {
                    this.value = opt.value;
                }
            }
            return this.command();
        },
        get: function (opt) {
            return this.value;
        }
    });

    return Entity;
});
