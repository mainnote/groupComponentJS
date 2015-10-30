define(['jquery', 'component', 'tpl!templates/input'
	], function ($, Component, tpl) {
	var Input = Component.create('Input');
	Input.extend({
		tpl : tpl,
		setup : function (opt) {
			var that = this;
			var inputElem = this.comp.find('input');
			inputElem.on('keypress', function (e) {
				clearTimeout($.data(this, 'timer'));
				var wait = setTimeout(function () {
						var opt_ = {
							value : inputElem.val()
						};
						that.checkValid(opt_);
					}, 500);
				$(this).data('timer', wait);
			});
		},
		checkValid : function (opt) { //to be overriden
			this.getResult({
				invalidHints : false
			});
		},
		getResult : function (opt) {
			var inputElem = this.comp.find('input');
			var hints = this.comp.find('.hints');
			if (opt.invalidHints) {
				this.comp.removeClass('has-success').addClass('has-warning');
				inputElem.removeClass('form-control-success').addClass('form-control-warning');
				hints.html(opt.invalidHints);
			} else {
				this.comp.removeClass('has-warning').addClass('has-success');
				inputElem.removeClass('form-control-warning').addClass('form-control-success');
				hints.html('');
			}
		},
	});

	return Input;
});
