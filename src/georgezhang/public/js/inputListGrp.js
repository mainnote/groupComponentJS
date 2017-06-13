define(['jquery', 'optGrp', 'inputList', 'listItemGrp', 'collectionGrp', 'Promise'], function($, OptGrp, InputList, ListItemGrp, CollectionGrp, Promise) {
    var InputListGrp = OptGrp.create('InputListGrp');

    var inputList = InputList.create('inputList');
    var listItemGrp = ListItemGrp.create('listItemGrp');
    var collectionGrp = CollectionGrp.create('collectionGrp');
    InputListGrp.join(inputList, listItemGrp, collectionGrp);

    InputListGrp.extend({
        set: function(opt) {
            this.call('inputList', 'render', opt);
        },
    });

    //inputList customization
    inputList.extend({
        setup: function(opt) {
            //setup list items
            var collection = this.group.call('collectionGrp', 'getMember', 'collection');
            var list_entities = collection.add({
                values: opt.list_entities || this.getInputValue(),
            });
            var opt_ = {
                container: this.comp.find('.list_items'),
                list_entities: list_entities,
            };
            this.group.call('listItemGrp', 'set', opt_);
            this.updateInputValue();

            return InputList.setup.call(this, opt);
        },
        getInputValue: function(opt) {
            var value = this.comp.find('input[type="hidden"]').val();
            try {
                return JSON.parse(decodeURIComponent(value));
            } catch (e) {
                return null;
            }
        },
        addItem: function(opt) {
            //rendering list next time
            var collection = this.group.call('collectionGrp', 'getMember', 'collection');
            var opt_next = {
                list_entities: collection.addExtra({
                    values: opt.entity
                }),
            };
            this.group.call('listItemGrp', 'set', opt_next);
            this.updateInputValue();
        },
        updateInputValue: function(opt) {
            var collection = this.group.call('collectionGrp', 'getMember', 'collection');
            var values = collection.getValues();
            this.comp.find('input[type="hidden"]').val(encodeURIComponent(JSON.stringify(values)));
        }
    });

    return InputListGrp;
});
