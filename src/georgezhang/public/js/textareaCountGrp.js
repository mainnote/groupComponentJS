define(['jquery', 'group', 'textarea', 'count'
	], function ($, Grp, Textarea, Count) {
	var TextareaCountGrp = Grp.group.create('TextareaCountGrp');
    var Textarea = Textarea.create('Textarea');
    var Count = Count.create('Count');
    TextareaCountGrp.join(Textarea, Count);
    
	TextareaCountGrp.extend({
        render: function(opt) {
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
