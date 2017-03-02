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
            this.entity = opt.item_entity;
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
        deleteEntityValue: function(opt) {
            this.entity.delete();
        },
        delete: function(opt) {
            //remove from list
            this.list.removeItem({
                itemObj: this.group
            });
            //destroy itself
            this.remove();
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
        },
        /* consider an item may have heavy UI. I try not to render it again. So, you have to decide which part might be changed during update. e.g. title, description etc. */
        updateUI: function(opt) {
            if (opt && opt.doc && opt.doc.item_value && typeof opt.doc.item_value == 'object') {
                throw new TypeError('Method item.updateUI have to be overriden for object value.');
            }
            this.comp.find('.item_value').html(opt.doc.item_value);
        },
        updateEntity: function(opt) {
            this.entity.update(opt);
        }
    });

    return Item;
});
