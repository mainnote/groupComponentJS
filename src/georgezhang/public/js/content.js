define(['jquery', 'component', 'tpl!templates/content'
	], function ($, Component, tpl) {
    var Content = Component.create('Content');
    Content.extend({
        tpl: tpl,
        defaultOpt: {
            content_class: 'text-muted',
            content_content: ''
        },
        reset: function (opt) {
            var content = this.comp;
            content.empty().html(opt.content_content);
            if (opt.content_class) {
                content.attr('class',
                    function (i, c) {
                        return c.replace(/(^|\s)text-\S+/g, '');
                    });
                content.addClass(opt.content_class);
            }
        },
    });

    return Content;
});
