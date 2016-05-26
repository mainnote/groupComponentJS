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
        remove: function (opt) {
            var that = this;
            var opt_ = {
                callback: function () {
                    //remove from list
                    that.list.removeItem({
                        itemObj: that
                    });

                    //remove UI
                    that.comp.remove();
                }
            };
            if (opt && opt.data) opt_.data = opt.data;
            this.entityCmd('remove', opt_);
        },
        fetch: function (opt) {
            var that = this;
            this.setOpt(opt);
            var opt_ = {
                callback: function (opt_callback) {
                    that.opt.callback(opt_callback);
                }
            };
            this.entityCmd('fetch', opt_);
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
