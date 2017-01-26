define(['jquery', 'component', 'tpl!templates/navtags'
	], function ($, Component, tpl) {
    var Navtags = Component.create('Navtags');
    Navtags.extend({
        tpl: tpl,
        setup: function (opt) {
            this.setElements({
                elements: opt.navtags_elements
            });
            return this.comp;
        },
        onActive: function (opt) {},
        clearActive: function (opt) {
            if (this.elements && $.isArray(this.elements))
                $.each(this.elements, function (index, elemObj) {
                    elemObj.clearActive();
                });
        }

    });

    return Navtags;
});
