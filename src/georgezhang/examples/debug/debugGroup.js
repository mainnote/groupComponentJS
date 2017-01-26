define(['jquery', 'component', 'tpl!debug/debugGroup', 'notify'
	], function ($, Component, tpl, notify) {
    var DebugGroup = Component.create('DebugGroup');
    DebugGroup.extend({
        tpl: tpl,
        defaultOpt: {
            debug_group_name: 'DebugGroupName',
        },
        setup: function (opt) {
            var that = this;
            if (opt.debug_obj) this.debug_obj = opt.debug_obj;
            var groupName = this.comp.find('.debugGroupName');
            groupName.on('click', function (event) {
                console.log('== ' + that._id + ' ==');
                if (that.debug_obj) console.dir(that.debug_obj);
				$.notify('Find group dump in Console', 'success');
            });
        },
    });

    return DebugGroup;
});
