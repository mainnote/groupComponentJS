define(['jquery', 'listItemGrp', 'input', 'button'], function($, ListItemGrp, Input, Button) {

    var MyListItemGrp = ListItemGrp.create('MyListItemGrp');
    var input = Input.create('input');
    var inputSetup = input.setup;
    input.extend({
        setup: function(opt) {
            var that = this;
            inputSetup.call(this, opt);
            this.inputElem.on('blur', function(evt) {
                that.remove();
            });
            var value = this.group.call('item', 'getEntityValue', opt);
            this.inputElem.val(value).focus();
            return this.comp;
        },
        checkValid: function(opt) {
            var input_value = this.inputElem.val();
            this.group.call('item', 'updateEntity', {
                value: input_value
            });

            //no error
            this.getResult({
                invalidHints: false
            });
            return true;
        },
    });

    var button = Button.create('button');
    button.setOpt({
        button_name: 'X',
        button_class: 'btn-sm btn-secondary remove'
    });

    button.extend({
        setup: function(opt){
            var that = this;
            this.comp.on('click', function(evt){
                that.group.call('item', 'deleteEntityValue');
                return false;
            });
            return this.comp;
        },
    });


    var itemGrp = MyListItemGrp.getMember('itemGrp');
    itemGrp.join(input, button);

    var item = itemGrp.getMember('item');
    var itemSetup = item.setup;
    item.extend({
        setup: function(opt) {
            var that = this;
            itemSetup.call(this, opt);
            this.comp.on('click', function(evt) {
                var MyInput = that.group.getMember('input');
                var myInput = MyInput.create();
                myInput.render({
                    container: that.comp
                });
            });

            //set elements
            var btn = this.group.getMember('button').create('btn');
            this.setElements({
                elements: [{
                    elem: btn
                }],
            });
        }
    });

    return MyListItemGrp;
});
