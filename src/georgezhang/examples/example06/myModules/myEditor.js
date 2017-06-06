/*
    For commercial use, you must visit http://ckeditor.com/pricing and purchase license from the related vendor.
*/

define(['jquery', 'textarea', 'ckeditor-jquery'], function($, Textarea, CJ) {
    var Editor = Textarea.create('Editor');
    var Editor_setup = Editor.setup;
    Editor.extend({
        setup: function(opt) {
            this.comp.ckeditor();
            //console.log('instances', CKEDITOR.instances.myTextEditor.getData());
            this.comp.before('<p class="section">Editor Demo:</p>');
            return Editor_setup.call(this, opt);
        },
    });

    return Editor;
});
