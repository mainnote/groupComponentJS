define(['jquery', 'component', 'tpl!templates/footer'
	], function ($, Component, tpl) {
    var Footer = Component.create('Footer');
    Footer.extend({
        tpl: tpl,
        defaultOpt: {
            footer_link: [],
            footer_p: [],
        },
        setup: function (opt) {
            //links
            var opt_link = {
                container: this.comp.find('ul.bd-footer-links'),
                elements: opt.footer_link,
            }
            this.setElements(opt_link);
            
            //paragraphs
            var opt_p = {
                container: this.comp.find('div.container'),
                elements: opt.footer_p,
            }
            this.setElements(opt_p);
            
            return this.comp;
        },
    });

    return Footer;
});
