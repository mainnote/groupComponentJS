define(['jquery', 'optGrp', 'input', 'entity', 'item'], function($, OptGrp, Input, Entity, Item) {
    var input = Input.create('input');
    input.extend({
        checkValid: function(opt) {
            var input_value = this.inputElem.val();
            this.group.call('entity', 'update', {
                value: input_value
            });

            //no error
            this.getResult({
                invalidHints: false
            });
            return true;
        },
    });
    var entity = Entity.create('entity');
    var item = Item.create('item');


    var MyInputItemGrp = OptGrp.create('MyInputItemGrp');
    MyInputItemGrp.join(input, entity, item);
    MyInputItemGrp.extend({
        setup: function(opt) {
            this.call('input', 'render', opt);

            var thisEntity = this.getMember('entity');
            this.call('item', 'render', $.extend({}, {
                item_data: thisEntity
            }, opt));
        },
    });

    return MyInputItemGrp;
});
