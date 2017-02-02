define(['jquery', 'component', 'tpl!templates/item'], function($, Component, tpl) {
    var Item = Component.create('Item');
    Item.extend({
        tpl: tpl,
        init: function() {
            Component.init.call(this);
            this.entity = null;
            this.list = null;
        },
        render: function(opt) {
            this.entity = opt.item_data;
            this.entity.setItem({
                item: this
            });
            this.list = opt.list;
            var opt_ = {
                container: opt.container,
                noSetup: opt.noSetup,
                item_value: this.entity.get(),
            };
            return Component.render.call(this, opt_);
        },
        getEntityValue: function(opt) {
            return this.entity.get();
        },
        removeAsync: function(opt) {
            var that = this;
            var opt_ = {};
            if (opt && opt.data) opt_.data = opt.data;
            return this.entity.removeAsync(opt_)
                .then(function(data) {
                    //remove from list
                    that.list.removeItem({
                        itemObj: that
                    });

                    //remove UI
                    that.comp.remove();

                    return data;
                });
        },
        postAsync: function(opt) {
            return this.entity.postAsync(opt);
        },
        fetchAsync: function(opt) {
            var that = this;
            this.setOpt(opt);
            return this.entity.fetchAsync();
        },
        update: function(opt) {
            //update UI
            this.updateUI({
                doc: {
                    item_value: this.entity.get(),
                },
            });

            //update entity
            //this.entity.update({
            //    value: opt.doc || {}
            //});
        },
        updateUI: function(opt) {
            this.comp.html(opt.doc.item_value);
        }
    });

    return Item;
});
