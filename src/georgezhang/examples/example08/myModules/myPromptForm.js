define(['jquery', 'promptFormGrp', 'button', 'notify', 'myApp/myModules/myFormOption'], function($, PromptFormGrp, Button, N, myFormOption) {
    var promptFormGrp = PromptFormGrp.create('promptFormGrp');
    var push_button = Button.create('push_button');

    //button start
    push_button.setOpt({
        button_name: 'Open'
    });
    var push_button_setup = push_button.setup;
    push_button.extend({
        setup: function(opt) {
            this.comp.before('<p class="section">Page Form</p>');
            push_button_setup.call(this, opt);

            this.comp.on('click', function(e) {
                e.preventDefault();
                var pf = promptFormGrp.create();
                pf.set({
                    container: opt.container,
                    prompt_title: 'Fill Information'
                });
            });
            return this.comp;
        }
    });

    //form
    var form = promptFormGrp.getMember('form');
    var form_done = form.done;

    form.setOpt(myFormOption.get());

    form.extend({
        done: function(opt) {
            form_done.call(this, opt);
            $.notify('Submitted this form successfully', 'info');
        }
    });

    //prompt
    var Modal = promptFormGrp.getMember('prompt');
    var Modal_setup = Modal.setup;
    var Modal_remove = Modal.remove;

    Modal.extend({
        setup: function(opt) {
            var comp = Modal_setup.call(this, opt);
            //push from left to right
            setTimeout(function(){
                comp.addClass('pushleft');
            }, 5);
            return comp;
        },
        remove: function(){
            var that = this;
            //eject from right to left
            this.comp.removeClass('pushleft');
            setTimeout(function(){
                Modal_remove.call(that);
            }, 1500);
        },
    });

    promptFormGrp.extend({
        setButton: function(opt) {
            push_button.render(opt);
        }
    });
    return promptFormGrp;
});
