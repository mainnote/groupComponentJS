define(['jquery', 'checkbox'], function ($, Checkbox) {
    var checkbox = Checkbox.create('checkbox');
    var checkbox_setup = checkbox.setup;
    checkbox.extend({
        setup: function(opt){
            this.comp.before('<p class="section">Checkbox Demo:</p>');
            return checkbox_setup.call(this, opt);
        }
    });

    checkbox.setOpt({
        checkbox_placeholder: 'Like it? '
    });
    return checkbox;
});
