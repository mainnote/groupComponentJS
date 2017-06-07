define(['jquery', 'formGrp', 'notify', 'myApp/myModules/myFormOption'], function($, FormGrp, N, myFormOption) {
    var formGrp = FormGrp.create('formGrp');

    var form = formGrp.getMember('form');

    form.setOpt(myFormOption.get());

    form.extend({
        done: function(opt) {
            $.notify('Submitted this form successfully', 'info');
        }
    });

    var form_setup = form.setup;
    form.extend({
        setup: function(opt){
            this.comp.before('<p class="section">Page Form</p>');
            return form_setup.call(this, opt);
        }
    });
    return formGrp;
});
