define(['jquery', 'listItemGrp', 'input', 'button', 'textarea', 'tpl!myApp/myTemplates/myItem'], function($, ListItemGrp, Input, Button, Textarea, tpl) {

    var MyListItemGrp = ListItemGrp.create('MyListItemGrp');
    //input change title
    var input = Input.create('input');
    var inputSetup = input.setup;
    input.extend({
        setup: function(opt) {
            var that = this;
            inputSetup.call(that, opt);
            that.inputElem.on('blur', function(evt) {
                that.remove();
            }).on('click', function(evt){
                return false;
            });
            var item_value = that.group.call('item', 'getEntityValue', opt);
            that.inputElem.val(item_value.snippet.title).focus();
            return that.comp;
        },
        checkValid: function(opt) {
            var that = this;

            var item_value = that.group.call('item', 'getEntityValue', opt);
            var input_value = that.inputElem.val();

            item_value.snippet.title = input_value;
            that.group.call('item', 'updateEntity', {
                value: item_value
            });

            //no error
            that.getResult({
                invalidHints: false
            });
            return true;
        },
    });

    var textarea = Textarea.create('textarea');
    var textareaSetup = textarea.setup;
    textarea.extend({
        setup: function(opt) {
            var that = this;
            textareaSetup.call(that, opt);

            var item_value = that.group.call('item', 'getEntityValue', opt);
            that.comp.on('click', function(evt){
                return false;
            });

            that.comp.on('blur', function(evt){
                var description = that.comp.val();

                item_value.snippet.description = description;
                that.group.call('item', 'updateEntity', {
                    value: item_value
                });
                
                that.remove();
            });
            that.comp.val(item_value.snippet.description).focus();
        },
    });

    //remove button
    var button = Button.create('button');
    button.setOpt({
        button_name: 'X',
        button_class: 'btn-sm btn-secondary remove'
    });

    button.extend({
        setup: function(opt) {
            var that = this;
            this.comp.on('click', function(evt) {
                that.group.call('item', 'deleteEntityValue');
                return false;
            });
            return this.comp;
        },
    });


    var itemGrp = MyListItemGrp.getMember('itemGrp');
    itemGrp.join(input, button, textarea);

    var item = itemGrp.getMember('item');
    item.tpl = tpl;
    var itemSetup = item.setup;
    item.extend({
        setup: function(opt) {
            var that = this;
            itemSetup.call(that, opt);

            //title editor
            var $title = that.comp.find('.card-title');
            $title.on('click', function(evt) {
                var MyInput = that.group.getMember('input');
                var myInput = MyInput.create();
                myInput.render({
                    container: $title
                });
            });

            //description editor
            var $description = that.comp.find('.card-text');
            $description.on('click', function(evt){
                var MyTextarea = that.group.getMember('textarea');
                var myTextarea = MyTextarea.create();
                myTextarea.render({
                    container: $description,
                    textarea_class: 'description_editor',
                    textarea_autoResize: false
                });
            });

            //set elements
            var btn = that.group.getMember('button').create('btn');
            that.setElements({
                elements: [{
                    elem: btn
                }],
            });
        },
        updateUI: function(opt) {
            this.comp.find('.card-title').html(opt.doc.item_value.snippet.title);
            this.comp.find('.card-text').html(opt.doc.item_value.snippet.description);
        },
    });

    return MyListItemGrp;
});
