define(['jquery', 'component', 'tpl!templates/button'
	], function ($, Component, tpl) {
	var Button = Component.create('Button');
	Button.extend({
        tpl: tpl,
	});

	return Button;
});
