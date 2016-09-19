define(['jquery', 'component', 'tpl!templates/iconToggle'
	], function ($, Component, tpl) {
    var IconToggle = Component.create('IconToggle');
    IconToggle.extend({
        tpl: tpl,
        defaultOpt: {
            iconToggle_class_unchecked: 'fa-check-circle-o',
            iconToggle_class_checked: 'fa-check-circle',
            iconToggle_checked: false,
        },
        init: function (opt) {
            this.isProcessing = false;
        },
        setup: function (opt) {
            var that = this;
            this.comp.on('click', function (e) {
                e.preventDefault();
                that.toggle();
            });
        },
        toggle: function (opt) {
            if (!this.isProcessing) {
                this.isProcessing = true;
                if (this.opt.iconToggle_checked) {
                    this.unchecked();
                } else {
                    this.checked();
                }
            }
        },
        checked: function (opt) {
            this.afterChecked();
        },
        afterChecked: function (opt) {
            this.opt.iconToggle_checked = true;
            this.isProcessing = false;
            this.comp.removeClass(this.opt.iconToggle_class_unchecked)
                .addClass(this.opt.iconToggle_class_checked);
        },
        unchecked: function (opt) {
            this.afterUnchecked();
        },
        afterUnchecked: function (opt) {
            this.opt.iconToggle_checked = false;
            this.isProcessing = false;
            this.comp.removeClass(this.opt.iconToggle_class_checked)
                .addClass(this.opt.iconToggle_class_unchecked);
        },
    });

    return IconToggle;
});
