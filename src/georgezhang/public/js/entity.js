define(['jquery', 'group'
	], function ($, Grp) {
    var Entity = Grp.obj.create('Entity');
    Entity.extend({
        value: null,
        update: function (opt) {
            this.value = opt.value;
            return this.command();
        },
        get: function (opt) {
            return this.value;
        },
    });

    return Entity;
});
