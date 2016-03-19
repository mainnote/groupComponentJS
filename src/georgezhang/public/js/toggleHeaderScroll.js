define(['jquery', 'group'
	], function ($, Grp) {
    var ToggleHeaderScroll = Grp.obj.create('ToggleHeaderScroll');
    ToggleHeaderScroll.extend({
        setToggleHeaderScroll: function (opt) {
            // Hide Header on on scroll down
            var didScroll;
            var lastScrollTop = 0;
            var delta = 5;
            var $header = opt && opt.hasOwnProperty('header') ? opt.header : $('header');
            var navbarHeight = $header.outerHeight();

            $(window).scroll(function (event) {
                didScroll = true;
            });

            setInterval(function () {
                if (didScroll) {
                    hasScrolled();
                    didScroll = false;
                }
            }, 250);

            function hasScrolled() {
                var st = $(this).scrollTop();

                // Make sure they scroll more than delta
                if (Math.abs(lastScrollTop - st) <= delta)
                    return;

                // If they scrolled down and are past the navbar, add class .nav-up.
                // This is necessary so you never see what is "behind" the navbar.
                if (st > lastScrollTop && st > navbarHeight) {
                    // Scroll Down
                    $header.hide();
                } else {
                    // Scroll Up
                    if (st + $(window).height() < $(document).height()) {
                        $header.show();
                    }
                }

                lastScrollTop = st;
            }
        }
    });

    return ToggleHeaderScroll;
});
