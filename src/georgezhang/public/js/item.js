define(['jquery', 'component', 'tpl!templates/item'
	], function ($, Component, tpl) {
    var Item = Component.create('Item');
    Item.extend({
        tpl: tpl,
        init: function () {
            Component.init.call(this);
            this.entityCmd = null;
            this.list = null;
        },
        render: function (opt) {
            this.entityCmd = opt.item_data;
            this.list = opt.list;
            var opt_ = {
                container: opt.container,
                noSetup: opt.noSetup,
                item_value: this.entityCmd('get'),
            };
            return Component.render.call(this, opt_);
        },
        getEntityValue: function (opt) {
            return this.entityCmd('get');
        },
        removeAsync: function (opt) {
            var that = this;
            var opt_ = {};
            if (opt && opt.data) opt_.data = opt.data;
            return this.entityCmd('removeAsync', opt_)
                .then(function (data) {
                    //remove from list
                    that.list.removeItem({
                        itemObj: that
                    });

                    //remove UI
                    that.comp.remove();

                    return data;
                });
        },
        postAsync: function (opt) {
            return this.entityCmd('postAsync', opt);
        },
        fetchAsync: function (opt) {
            var that = this;
            this.setOpt(opt);
            return this.entityCmd('fetchAsync');
        },
        update: function (opt) {
            //update UI
            this.updateUI(opt);
            //update entity
            this.entityCmd('update', {
                value: opt.doc || {}
            });
        },
        updateUI: function (opt) {
            this.comp.html(opt.doc);
        }
    });

    return Item;
});
