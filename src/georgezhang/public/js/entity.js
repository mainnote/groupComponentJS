define(['jquery', 'optObj'], function($, OptObj) {
    var Entity = OptObj.create('Entity');
    Entity.extend({
        init: function() {
            OptObj.init.call(this);
            this.value = null;
            this.items = []; //items
        },
        update: function(opt) {
            if (opt.hasOwnProperty('value')) {
                if ($.isPlainObject(opt.value)) {
                    this.value = $.extend({}, this.value || {}, opt.value);
                } else {
                    this.value = opt.value;
                }
                this.notify({
                    action: 'update'
                });
            }
            return this;
        },
        notify: function(opt) {
            $.each(this.items, function(index, item) {
                item[opt.action]();
            });
        },
        setItem: function(opt) {
            this.items.push(opt.item);
        },
        get: function(opt) {
            return this.value;
        },
        delete: function(opt) {
            if (this.group) {
                this.group.call('collection', 'remove', {
                    entity: this
                });
            }
            this.notify({
                action: 'delete'
            });
        },
    });

    return Entity;
});
