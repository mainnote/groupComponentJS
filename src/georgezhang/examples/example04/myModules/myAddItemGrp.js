define(['jquery', 'optGrp', 'button', 'promptFormGrp', 'myApp/myModules/myAddItemFormGrp'], function($, OptGrp, Button, PromptFormGrp, myAddItemFormGrp) {
    var MyAddItemGrp = OptGrp.create('MyAddItemGrp');
    var button_add = Button.create('button_add');
    var prompt_add_itemGrp = PromptFormGrp.create('prompt_add_itemGrp');

    var button_add_setup = button_add.setup;
    button_add.extend({
        setup: function(opt) {
            var that = this;
            button_add_setup.call(this, opt);
            this.comp.on('click', function(evt) {
                var P = that.group.getMember('prompt_add_itemGrp');
                var prompt = P.create();
                prompt.render({
                    container: $('#mnbody'),
                    prompt_title: 'Add new item'
                });
            });
        },
    });

    myAddItemFormGrp(prompt_add_itemGrp.getMember('formGrp'));

    MyAddItemGrp.join(button_add, prompt_add_itemGrp);
    MyAddItemGrp.extend({
        set: function(opt) {
            this.call('button_add', 'render', opt);
        },
    });

    return MyAddItemGrp;
});
