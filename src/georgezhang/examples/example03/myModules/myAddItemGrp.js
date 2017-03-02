define(['jquery', 'optGrp', 'button', 'promptFormGrp'], function($, OptGrp, Button, PromptFormGrp) {
    var MyAddItemGrp = OptGrp.create('MyAddItemGrp');
    var button_add = Button.create('button_add');
    var prompt_add_item = PromptFormGrp.create('prompt_add_item');

    var button_add_setup = button_add.setup;
    button_add.extend({
        setup: function(opt) {
            var that = this;
            button_add_setup.call(this, opt);
            this.comp.on('click', function(evt){
                var prompt_add_item = that.group.getMember('prompt_add_item');
                var prompt = prompt_add_item.create();
                prompt.render({
                    container: $('#mnbody'),
                    prompt_title: 'Add new item'
                });
            });
        },
    });

    MyAddItemGrp.join(button_add, prompt_add_item);
    MyAddItemGrp.extend({
        set: function(opt) {
            this.call('button_add', 'render', opt);
        },
    });

    return MyAddItemGrp;
});
