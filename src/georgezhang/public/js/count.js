define(['jquery', 'component', 'tpl!templates/count'
	], function ($, Component, tpl) {
	var Count = Component.create('Count');
	Count.extend({
        tpl: tpl,
        setup: function(opt) {
            var that = this;
            this.watchComp.on('input', function(e){
                e.preventDefault();
                e.stopPropagation();
                var val = $(this).val();
                var opt_ = {
                    val: val,
                };
                that.count(opt_);
            });
            return this.comp;
        },
        
		render : function (opt) {
			var showTpl = $(this.template());
			opt.comp.after(showTpl);
            this.comp = showTpl;
            this.watchComp = opt.comp;
            this.maxCount = opt.maxCount;
			return this.setup();
		},
        
        count: function(opt) {
            var count = opt.val.length;
            if (this.maxCount) {
                var remaining = this.maxCount - count;
                if (remaining < 0) {
                    this.overMaxCount(opt);
                } else {
                    this.comp.text(remaining + ' characters remaining');
                }
            } else {
                this.comp.text(count + ' characters totally');
            }
        },
        
        overMaxCount: function(opt) {
            this.watchComp.val(opt.val.substring(0, this.maxCount));
        },
	});

	return Count;
});
