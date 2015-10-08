define(['jquery', 'group', 'prompt', 'form'
	], function ($, Grp, Prompt, Form) {
	var PromptFormGrp = Grp.group.create('PromptFormGrp');
    var prompt = Prompt.create('prompt');
    var form = Form.create('form');
    PromptFormGrp.join(prompt, form);
    
    prompt.extend({
        afterRender: function(opt) {
            var promptComp = Prompt.afterRender.call(this, opt);
            opt.container = promptComp;
            var formComp = form.command()('render', opt);
            return promptComp;
        },
        
        donePrompt: function(opt) {
            var formValue = this.group.call('form', 'serialize', opt);
            console.log(formValue);
            Prompt.donePrompt.call(this, opt);
        },
    });
    
	PromptFormGrp.extend({
        render: function(opt) {
            return this.call('prompt', 'render', opt);
        },
	});

	return PromptFormGrp;
});
