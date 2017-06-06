define(['jquery', 'iconToggle'], function($, IconToggle){
    var iconToggle = IconToggle.create('iconToggle');
    var iconToggle_setup = iconToggle.setup;
    iconToggle.extend({
        setup: function(opt){
            this.comp.before('<p class="section">Icon Toggle Demo:</p>');
            return iconToggle_setup.call(this, opt);
        }
    });

    return iconToggle;
});
