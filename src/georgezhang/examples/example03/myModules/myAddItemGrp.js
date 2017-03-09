define(['jquery', 'optGrp', 'button', 'promptFormGrp', 'myApp/myModules/myAddItemFormGrpWrap'], function($, OptGrp, Button, PromptFormGrp, wrap) {
    var MyAddItemGrp = OptGrp.create('MyAddItemGrp');
    var button_add = Button.create('button_add');
    var prompt_add_item = PromptFormGrp.create('prompt_add_item');
    wrap(prompt_add_item);

    var button_add_setup = button_add.setup;
    button_add.extend({
        setup: function(opt) {
            var that = this;
            button_add_setup.call(this, opt);
            this.comp.on('click', function(evt) {
                var prompt_add_item = that.group.getMember('prompt_add_item').create();
                prompt_add_item.render({
                    container: $('#mnbody'),
                    prompt_title: 'Add new item'
                });
            });
        },
    });

    MyAddItemGrp.join(button_add, prompt_add_item);
    MyAddItemGrp.extend({
        set: function(opt) {
            var opt_ = $.extend({}, opt, {
                container: $('.add_item')
            });
            this.call('button_add', 'render', opt_);
        },
    });

    return MyAddItemGrp;
});
