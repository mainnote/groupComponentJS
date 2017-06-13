define(['jquery', 'promptFormGrp', 'myApp/myModules/MyInputListGrp_formOption'], function($, PromptFormGrp, MyInputListGrp_formOption) {
    var promptFormGrp = PromptFormGrp.create('promptFormGrp');
    var form = promptFormGrp.getMember('form');
    form.setOpt(MyInputListGrp_formOption.get());

    form.extend({
        submit: function(opt) {
            //interact with inputList
            if (!this.submitting && this.checkValid()) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function(index) {
                    $(this).remove();
                });

                var inputData = this.serializeArray();
                var opt_;

                if (this.opt.action == 'add') {
                    opt_ = $.extend({}, opt, {
                        inputData: inputData,
                        entity: this.extractForm({
                            inputData: inputData
                        })
                    });
                    this.group.upCall('inputList', 'addItem', opt_);
                    this.done(opt_);
                } else {
                    opt_ = {
                        value: this.extractForm({
                            inputData: inputData
                        })
                    };
                    this.group.upCall('item', 'updateEntity', opt_);
                    this.group.upCall('inputList', 'updateInputValue');
                    this.done(opt_);
                }
            }
        },
        extractForm: MyInputListGrp_formOption.extractForm,
    });


    //prompt push left
    var Modal = promptFormGrp.getMember('prompt');
    var Modal_setup = Modal.setup;
    var Modal_remove = Modal.remove;

    Modal.extend({
        setup: function(opt) {
            var comp = Modal_setup.call(this, opt);
            //push from left to right
            setTimeout(function() {
                comp.addClass('pushleft');
            }, 5);
            return comp;
        },
        remove: function() {
            var that = this;
            //eject from right to left
            this.comp.removeClass('pushleft');
            setTimeout(function() {
                Modal_remove.call(that);
            }, 1500);
        },
    });

    return promptFormGrp;
});
