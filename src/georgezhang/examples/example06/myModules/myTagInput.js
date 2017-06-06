define(['jquery', 'tagsinput'], function ($, Tagsinput) {
    var tagsinput = Tagsinput.create('tagsinput');
    var tagsinput_setup = tagsinput.setup;
    tagsinput.extend({
        setup: function(opt){
            this.comp.before('<p class="section">Tags Input Demo:</p>');
            return tagsinput_setup.call(this, opt);
        }
    });

    tagsinput.setOpt({
        tagsinput_placeholder: 'Tags',
        tagsinput_values: ['ok']
    });

    return tagsinput;
});
