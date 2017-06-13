define(['jquery', 'optGrp', 'textarea', 'count'], function($, OptGrp, Textarea, Count) {
    var TextareaCountGrp = OptGrp.create('TextareaCountGrp');
    TextareaCountGrp.join(Textarea, Count);

    TextareaCountGrp.extend({
        set: function(opt) {
            var textareaComp = this.call('Textarea', 'render', opt);
            var opt_ = {
                comp: textareaComp,
                maxCount: opt.textareaCountGrp_maxCount,
            };
            this.call('Count', 'render', opt_);
        },
    });

    return TextareaCountGrp;
});
