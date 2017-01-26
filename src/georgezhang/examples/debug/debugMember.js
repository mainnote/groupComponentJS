define(['jquery', 'component', 'tpl!debug/debugMember'
	], function ($, Component, tpl) {
    var DebugMember = Component.create('DebugMember');
    DebugMember.extend({
        tpl: tpl,
        defaultOpt: {
            debug_member_name: 'DebugMemberName',
        },
        setup: function (opt) {
            var that = this;
            if (opt.debug_obj) this.debug_obj = opt.debug_obj;
            this.comp.on('click', function (event) {
                console.log('== ' + that._id + ' ==');
                if (that.debug_obj) console.dir(that.debug_obj);
				$.notify('Find object dump in Console', 'success');
            });
        },
    });

    return DebugMember;
});
