var document = window.document;

var addCssRule = function (selectorString, styleString) {
    if (window.document.getElementsByTagName('style').length === 0) {
        var tempStyle = window.document.createElement('style');
        tempStyle.setAttribute('type', 'text/css');
        window.document.getElementsByTagName('head')[0].appendChild(tempStyle);
    }

    window.document.getElementsByTagName('style')[0].appendChild(window.document.createTextNode(selectorString + '{' + styleString + '}'));
};

var swipe = function ($container, option) {
    option = option || {};

    this.__cur = option.initIndex || 0;
    var loop = !!option.loop;
    var dir = option.direction || 'h';
    var onmoving = option.onmoving || function () {};
    var onmoved = option.onmoved || function () {};
    var duration = option.duration || 3000;
    var transDuration = 300;

    ensure_elements: {
        $container.className += ' swipe-container';
        var $items = $container.querySelector('.items');
        $items.style.cssText += 'position: relative;font-size:0;-webkit-transition:all ' + (transDuration/1000) + 's ease;transition:all ' + (transDuration/1000) + 's ease;width:100%;height:100%;' + (dir === 'h' ? 'white-space: nowrap;' : '');
        addCssRule('.swipe-container .item', 'width:100%;height:100%;font-size:16px;' + (option.cssText.item || '') + (dir === 'h' ? 'display:inline-block;' : ''));
        var $indicators = document.createElement('div');
        $indicators.className = 'swipe-indicators';
        $indicators.style.cssText = 'position:absolute;text-align:center;'
            + (option.cssText.indicators || '');
        addCssRule('.swipe-indicators .indicator', option.cssText.indicator || '');
        addCssRule('.swipe-indicators .indicator.current', option.cssText.indicatorCurrent || '');
    }

    var setHOffset = function (v) {
        offset.x = v;
        $items.style.transform = $items.style.WebkitTransform = 'translate3d(' + v + 'px,0,0)';
    };
    var setVOffset = function (v) {
        offset.y = v;
        $items.style.transform = $items.style.WebkitTransform = 'translate3d(0,' + v + 'px,0)';
    };

    init: {
        var containerSize = {
            w: $container.clientWidth,
            h: $container.clientHeight
        };
        var offset = {
            x: dir === 'h' ? (0 - this.__cur * containerSize.w) : 0,
            y: dir === 'v' ? (0 - this.__cur * containerSize.h) : 0
        };
        dir === 'h' ? setHOffset(offset.x) : setVOffset(offset.y);
    }

    var offsetItemCount = function () {
        return dir === 'h' ? (-offset.x / containerSize.w) : (-offset.y / containerSize.h);
    };

    var _this = this;

    interval: {
        var _interval = null;
        var interval = function () {
            _interval && window.clearInterval(_interval);
            _interval = window.setInterval(function () {
                _this.move(1);
            }, duration);
        };
        interval();
    }

    bind_events: {
        var touchPos = { x: 0, y: 0 },
            touchstartTime = 0;
        $items.addEventListener('touchstart', function (e) {
            _interval && window.clearInterval(_interval);
            var touchobj = e.changedTouches[0];
            touchPos.x = touchobj.pageX;
            touchPos.y = touchobj.pageY;
            touchstartTime = Date.now();
        }, false);
        $items.addEventListener('touchmove', function (e) {
            _interval && window.clearInterval(_interval);
            var touchobj = e.changedTouches[0];
            if (dir === 'h') {
                setHOffset(offset.x + touchobj.pageX - touchPos.x);
            } else {
                setVOffset(offset.y + touchobj.pageY - touchPos.y);
            }
            touchPos.x = touchobj.pageX;
            touchPos.y = touchobj.pageY;
        }, false);
        $items.addEventListener('touchend', function (e) {
            var offsetItemNumber = Math.round(offsetItemCount());
            _this.goto(offsetItemNumber);
            interval();
        }, false);
    }

    var disableDuration = function () {
        $items.style.transition = $items.style.WebkitTransition = '';
    };
    var enableDuration = function () {
        $items.style.transition = $items.style.WebkitTransition = 'all ' + (transDuration/1000) + 's ease';
    };

    this.current = function () {
        return $container.querySelector('.items>.item:nth-child(' + this.__cur + ')');
    };
    this.size = function () {
        return $container.querySelectorAll('.items>.item').length;
    };
    this.move = function (step) {
        var size = this.size(),
            cur = this.__cur;
        if (cur + step >= size) {
            this.__cur = 0;
        } else if (cur + step < 0) {
            this.__cur = size - 1;
        } else {
            this.__cur = cur + step;
        }
        if (dir === 'h') {
            if (cur === size - 1 && step === 1) {
                _interval && window.clearInterval(_interval);
                setHOffset(-size * containerSize.w);
                window.setTimeout(function () {
                    disableDuration();
                    setHOffset(containerSize.w);
                    window.setTimeout(function () {
                        enableDuration();
                        setHOffset(0);
                        window.setTimeout(function () {
                            interval();
                        }, transDuration);
                    }, transDuration);
                }, transDuration);
            } else if (cur === 0 && step === -1) {
                _interval && window.clearInterval(_interval);
                setHOffset(containerSize.w);
                window.setTimeout(function () {
                    disableDuration();
                    setHOffset(-size * containerSize.w);
                    window.setTimeout(function () {
                        enableDuration();
                        setHOffset(-(size - 1) * containerSize.w);
                        window.setTimeout(function () {
                            interval();
                        }, transDuration);
                    }, transDuration);
                }, transDuration);
            } else {
                setHOffset(-this.__cur * containerSize.w);
                onmoved(this.__cur, cur);
            }
        } else {
            if (cur === size - 1 && step === 1) {
                _interval && window.clearInterval(_interval);
                setVOffset(-size * containerSize.h);
                window.setTimeout(function () {
                    disableDuration();
                    setVOffset(containerSize.h);
                    window.setTimeout(function () {
                        enableDuration();
                        setVOffset(0);
                        window.setTimeout(function () {
                            interval();
                        }, transDuration);
                    }, transDuration);
                }, transDuration);
            } else if (cur === 0 && step === -1) {
                _interval && window.clearInterval(_interval);
                setVOffset(containerSize.h);
                window.setTimeout(function () {
                    disableDuration();
                    setVOffset(-size * containerSize.h);
                    window.setTimeout(function () {
                        enableDuration();
                        setVOffset(-(size - 1) * containerSize.h);
                        window.setTimeout(function () {
                            interval();
                        }, transDuration);
                    }, transDuration);
                }, transDuration);
            } else {
                setVOffset(-this.__cur * containerSize.h);
                onmoved(this.__cur, cur);
            }
        }
    };
    this.goto = function (index) {
        return this.move(index - this.__cur);
    };
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = swipe;
    }
} else {
    window.Swipe = swipe;
}
