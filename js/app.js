/*Fixed menu class*/
(function(){
    function FixedMenu(options) {
        this._menu = options.menu;
        this._fixedClass = options.fixedClass || 'js-top-fixed';
        this._menuIsFixed = false;
        this._staticMenuPosition = -1;
        this._isPageSearch = options.pageSearch || true;
        this._pageSearchBlock = options.pageSearchBlock || options.menu;
        this._pageSearchClass = options.pageSearchClass || 'active';
    }
    FixedMenu.prototype.init = function () {
        var setActiveLi = this.pageScrollListener();

        $(window).on({
            'load': function () {
                this.getStaticMenuPos();
                setActiveLi();
            }.bind(this),
            'scroll': function () {
                this.toggleMenuPosition();
                setActiveLi();
            }.bind(this),
            'resize': this.getStaticMenuPos.bind(this)
        });
    };
    FixedMenu.prototype.getCoords = function (elem) {
        var box = elem.getBoundingClientRect();

        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset
        };
    };
    FixedMenu.prototype.toggleMenuPosition = function (off) {
        var $menu = $(this._menu);

        if ($menu.is(':hidden')) return;

        if (window.pageYOffset <= this._staticMenuPosition && this._menuIsFixed || off) {
            $menu.removeClass(this._fixedClass);
            this._menuIsFixed = false;
            return;
        } else if (window.pageYOffset > this._staticMenuPosition && !this._menuIsFixed){
            $menu.addClass(this._fixedClass);
            this._menuIsFixed = true;
        }
    };
    FixedMenu.prototype.pageScrollListener = function () {
        var activeLink = null;
        var activeSection = null;
        var links = this._menu.querySelectorAll('a[href^="#"]');
        var self = this;

        return function () {
            if (!self._isPageSearch) return;
            if ($(self._menu).is(':hidden')) return;

            var coordsPageSearchBlock = self._pageSearchBlock.getBoundingClientRect();
            var elem = document.elementFromPoint(self._pageSearchBlock.offsetWidth/2,
                coordsPageSearchBlock.bottom + self.getExtraLength());

            //console.dir(elem);

            if (!elem && activeLink) {
                activeLink.closest('li').classList.remove(self._pageSearchClass);
                activeLink = null;
                activeSection = null;
                return;
            } else if (!elem) {
                return;
            }

            if (activeLink && activeSection && activeSection.contains(elem)) {
                return;
            }

            for (var i = 0; i < links.length; i++) {
                var href = links[i].getAttribute('href');

                if(href.length < 2) continue;

                var targetSection = elem.closest(href);

                if (targetSection) {
                    if (activeLink) {
                        activeLink.closest('li').classList.remove(self._pageSearchClass);
                    }
                    activeSection = targetSection;
                    activeLink = links[i];
                    activeLink.closest('li').classList.add(self._pageSearchClass);
                    return;
                }
            }

            if(activeLink) {
                activeLink.closest('li').classList.remove(self._pageSearchClass);
                activeLink = null;
                activeSection = null;
            }

        };
    };
    FixedMenu.prototype.getStaticMenuPos = function () {
        if ($(this._menu).is(':hidden')) return;

        this.toggleMenuPosition(true);
        this._staticMenuPosition = this.getCoords(this._menu).top;
        this.toggleMenuPosition();
    };
    FixedMenu.prototype.getExtraLength = function () {
        var pageYOffset = window.pageYOffset ||  document.documentElement.scrollTop;
        var extraLength = 50;

        if (pageYOffset < 300) { //if it is beginning of start page make meter longer
            extraLength = 100;
        }

        return extraLength;
    };

    $.fn.fixedMenu = function () {
        var options = typeof arguments[0] === 'object' ? arguments[0] : {};

        $(this).each(function () {
            options.menu = this;

            var controller = new FixedMenu(options);
            controller.init();
        });
    };
})();


$(document).ready(function () {
    /*input number*/
    (function () {
        var inputNumber = $('[data-role="order-counter"]');
        var options = {
            labels: {
                up: "+",
                down: "-"
            }
        };

        //$.stepper("defaults", options);
        inputNumber.stepper();
        //console.log($.stepper);
    })();

    /*hide on scroll*/
    (function () {
        var throttledHidePartialMenu = throttle(hidePartialMenu(), 400);

        hidePartialMenu();
        $(window).on('scroll', throttledHidePartialMenu);

        function hidePartialMenu() {
            var isHidden = false;

            return function () {
                var pageYOffset = window.pageYOffset ||  document.documentElement.scrollTop;
                var block = $('.header__bottom-line');
                var offset = 20;
                //console.log(pageYOffset);

                if (pageYOffset > offset && !isHidden) {
                    block.slideUp();
                    isHidden = true;
                } else if (pageYOffset <= offset && isHidden) {
                    block.slideDown();
                    isHidden = false;
                }
            }
        }

        function throttle(func, ms) {

            var isThrottled = false,
                savedArgs,
                savedThis;

            function wrapper() {

                if (isThrottled) { // (2)
                    savedArgs = arguments;
                    savedThis = this;
                    return;
                }

                func.apply(this, arguments); // (1)

                isThrottled = true;

                setTimeout(function() {
                    isThrottled = false; // (3)
                    if (savedArgs) {
                        wrapper.apply(savedThis, savedArgs);
                        savedArgs = savedThis = null;
                    }
                }, ms);
            }

            return wrapper;
        }
    })();

    /*ScrollToAnchor && mobile menu*/
    (function(){
        /*ScrollToAnchor class*/
        function ScrollToAnchor(options) {
            this._listenedBlock = options.listenedBlock || document.body;
            this._translationElementSelector = options.translation || false;
        }

        ScrollToAnchor.prototype.init = function () {
            $(this._listenedBlock).on('click', this.anchorClickListener.bind(this));
        };
        ScrollToAnchor.prototype.anchorClickListener = function (e) {
            var elem = e.target;
            var anchor = elem.closest('a[href*="#"]:not([data-scroll="disable"])');

            if (!anchor) return;

            var anchorWithHash = anchor.closest('a[href^="#"]');
            var windowPath = window.location.origin + window.location.pathname;
            var anchorPath = anchor.href.slice(0, anchor.href.indexOf('#'));

            if (windowPath === anchorPath) {
                anchorWithHash = anchor;
            }

            if (!anchorWithHash || anchorWithHash.hash.length < 2) return;

            e.preventDefault();

            var target = anchorWithHash.hash;
            var translation = this.getTranslation(anchorWithHash);

            if (!document.querySelector(target)) return;

            this.smoothScroll(target, translation);
        };
        ScrollToAnchor.prototype.getTranslation = function (anchor) {
            var translation = 0;

            if (anchor.hasAttribute('data-translation')) {
                translation = anchor.getAttribute('data-translation');
            } else if (this._translationElementSelector) {
                $(this._translationElementSelector).each(function () {
                    translation += this.offsetHeight;
                });
                //translation = document.querySelector(this._translationElementSelector).offsetHeight;
            }

            return translation;
        };
        ScrollToAnchor.prototype.smoothScroll = function (selector, translation) {
            $("html, body").animate({
                    scrollTop: $(selector).offset().top - (translation || 0)
                },
                500
            );
        };

        /*content scroll*/
        (function(){
            var pageScroll = new ScrollToAnchor({
                listenedBlock: '.page-wrap',
                translation: '.header__top-line, .shadow-line'
            });
            pageScroll.init();
        })();

        /*aside menu scroll*/
        (function(){
            var pageScroll = new ScrollToAnchor({
                listenedBlock: '.goods-menu',
                translation: '.header__top-line, .shadow-line'
            });
            pageScroll.init();
        })();

        /*mmenu*/
        (function(){
            /*mmenu scroll*/
            var mmenuScroll = new ScrollToAnchor({
                listenedBlock: document.getElementById('#m-menu'),
                translation:  '.header__top-line, .shadow-line'
            });


            setUpMmenu();

            function setUpMmenu() {
                var $menu = $('nav#m-menu');
                var $openMenuBtn = $('#hamburger');
                var isMenuOpen = false;

                $menu.mmenu({
                    "extensions": ["theme-dark"]
                });

                var selector = false;
                $menu.find( 'li > a' ).on(
                    'click',
                    function( e )
                    {
                        selector = this.hash;
                    }
                );

                var api = $menu.data( 'mmenu' );
                api.bind( 'closed',
                    function() {
                        if (selector) {
                            mmenuScroll.smoothScroll(selector,  document.querySelector(mmenuScroll._translationElementSelector).offsetHeight);
                            selector = false;
                        }
                    }

                );
                $openMenuBtn.click(function () {
                    if (isMenuOpen) {
                        api.close();
                    } else {
                        api.open();
                    }
                });

            }
        })();
    })();

    /*desktop menu*/
    (function () {
        var desktopMenu = $('.goods-menu');
        var options = {
            pageSearchBlock: document.querySelector('.header')
        };

        desktopMenu.fixedMenu(options);
    })();
});