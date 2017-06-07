define(['jquery', 'optGrp', 'button', 'prompt'], function($, OptGrp, Button, Prompt) {
    var Push_button = Button.create('Push_button');
    Push_button.extend({
        setup: function(opt) {
            var that = this;
            this.comp.on('click', function(e) {
                e.preventDefault();
                var m = that.group.call('Modal', 'create', 'modal' + opt.level.toString());
                m.render({
                    container: opt.container,
                    prompt_title: 'Show Level ' + opt.level.toString(),
                    level: opt.level + 1
                });
            });
            return this.comp;
        }
    });

    var Modal = Prompt.create('Modal');
    var Modal_setup = Modal.setup;
    var Modal_remove = Modal.remove;

    Modal.extend({
        setup: function(opt) {
            var comp = Modal_setup.call(this, opt);
            //add some space from top to the bottom of header
            comp.append('<p class="promptHeadSpace"></p>');
            //add sample text. or you can render any components
            comp.append('<p>Some quick example text to build on the card title and make up the bulk of the card\'s content.In user interface design for computer applications, a modal window is a graphical control element subordinate to an application\'s main window. It creates a mode that disables the main window, but keeps it visible with the modal window as a child window in front of it.</p>');

            //render a button
            var b = this.group.call('Push_button', 'create', 'push_button' + opt.level.toString());
            b.render({
                container: comp,
                button_name: 'Go Level ' + opt.level.toString(),
                level: opt.level
            });
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

    var ModalGrp = OptGrp.create('ModalGrp');
    ModalGrp.join(Push_button, Modal);
    ModalGrp.extend({
        set: function(opt) {
            opt.level = 1;
            opt.button_name = 'Go Level ' + opt.level.toString();
            //as we are going to reuse the push_button, we had better to instantial it.
            var b = this.call('Push_button', 'create', 'push_button' + opt.level.toString());
            b.render(opt);
        }
    });

    return ModalGrp;
});
