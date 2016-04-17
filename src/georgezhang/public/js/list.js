define(['jquery', 'component', 'tpl!templates/list.html',
	], function ($, Component, tpl) {
    var List = Component.create('List');
    List.extend({
        tpl: tpl,
        items: [],
        reset: function (opt) {
            //make the original frame firm by setting min-height and width
            this.comp.css({
                'min-height': this.comp.css('height'),
                'min-width': this.comp.css('width')
            });

            this.items = [];
            this.comp.empty();
        },
        setup: function (opt) {
            var that = this;
            if (opt.list_data && $.isArray(opt.list_data)) {
                $.each(opt.list_data, function (index, data) {
                    var itemCmd = that.group.call('Item', 'create', 'itemCmd').command(); //member create
                    that.items.push(itemCmd);
                    var opt_ = {
                        noSetup: true,
                        list: that,
                        container: that.comp,
                        item_data: data,
                    };
                    var itemComp = itemCmd('render', opt_);
                    itemCmd('setup');
                    return itemComp;
                });

                //remove fixed css value so that less blank under the list
                var minH = this.comp.css('min-height');
                var winH = $(window).height() / 2;
                this.comp.css({
                    'min-height': minH > winH ? winH : minH,
                    'min-width': ''
                });
            }
        },
        removeItem: function (opt) {
            this.items = $.grep(this.items, function (itemObj, idx) {
                if (opt.itemObj === itemObj) return true;
            });
        }
    });

    return List;
});
