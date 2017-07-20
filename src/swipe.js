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
    var notAuto = !!option.notAuto;
    var dir = option.direction || 'h';
    var duration = option.duration || 3000;
    var transDurationDefault = 300;
    var transDuration = option.transDuration || transDurationDefault;
    var parentSelector = option.parentSelector || ('swipe_' + Math.floor(Math.random() * 10000));

    this.size = function () {
        return $container.querySelectorAll('.items>.item').length;
    };
    
    add_global_style: {
        if (!window.swipe_global_style_added) {
            addCssRule('.swipe-container .item', 'width:100%;height:100%;font-size:initial;');
            addCssRule('.swipe-container-h .item', 'display:inline-block;');
            addCssRule('.swipe-container-h .items', 'white-space:nowrap;font-size:0;');
            addCssRule('.swipe-container .swipe-indicators', 'position:absolute;text-align:center;font-size:0;');
            addCssRule('.swipe-container-h .swipe-indicators', 'width:100%;height:10px;left:0;bottom:4px;');
            addCssRule('.swipe-container-v .swipe-indicators', 'width:10px;right:0;top:50%;-webkit-transform:translate(0,-50%);transform:translate(0,-50%);');
            addCssRule('.swipe-container .swipe-indicators .indicator', 'display:inline-block;width:4px;height:4px;border-radius:100px;background:rgba(0,0,0,.4);margin:2px;');
            addCssRule('.swipe-container .swipe-indicators .indicator.current', 'background:rgba(207,207,207,.4);');
            
            window.swipe_global_style_added = true;
        }
    }

    ensure_elements: {
        $container.className += ' ' + parentSelector + ' swipe-container ' + (dir === 'h' ? 'swipe-container-h' : 'swipe-container-v');
        
        var $items = $container.querySelector('.items');
        $items.style.cssText += '-webkit-transition:all ' + (transDuration/1000) + 's ease;transition:all ' + (transDuration/1000) + 's ease;';
        option.cssText.item && addCssRule('.' + parentSelector + ' .item', option.cssText.item);
        
        var $indicators = document.createElement('div');
        $indicators.className = 'swipe-indicators';
        option.cssText.indicators       && addCssRule('.' + parentSelector + ' .swipe-indicators', option.cssText.indicators);
        option.cssText.indicator        && addCssRule('.' + parentSelector + ' .swipe-indicators .indicator', option.cssText.indicator);
        option.cssText.indicatorCurrent && addCssRule('.' + parentSelector + ' .swipe-indicators .indicator.current', option.cssText.indicatorCurrent);
        for (var i = 0, s = this.size(); i < s; i++) {
            var $indicator = document.createElement('div');
            $indicator.className = 'indicator';
            $indicators.appendChild($indicator);
        }
        $container.appendChild($indicators);
    }

    var setHOffset = function (v) {
        offset.x = v;
        $items.style.transform = $items.style.WebkitTransform = 'translate3d(' + v + 'px,0,0)';
    };
    var setVOffset = function (v) {
        offset.y = v;
        $items.style.transform = $items.style.WebkitTransform = 'translate3d(0,' + v + 'px,0)';
    };

    var _this = this;

    var syncIndicator = function () {
        var $indicators = [].slice.call($container.querySelectorAll('.swipe-indicators .indicator'), 0);
        $indicators.forEach(function ($item, i) {
            if (i !== _this.__cur) {
                $item.classList.remove('current');
            } else {
                $item.classList.add('current');
            }
        });
    };
    syncIndicator();

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

    interval: {
        var _interval = null;
        var interval = function () {
            if (notAuto) return;
            _interval && window.clearInterval(_interval);
            _interval = window.setInterval(function () {
                _this.move(1);
            }, duration);
        };
        interval();
    }

    // var onmoving = option.onmoving || function () {};
    var onmoved = function () {
        interval();
        syncIndicator();
        option.onmoved.apply(option, [].slice.call(arguments, 0));
    } || function () {};

    bind_events: {
        var touchPos = { x: 0, y: 0 },
            touchstartPos = { x: 0, y: 0 },
            touchstartTime = 0;
        $items.addEventListener('touchstart', function (e) {
            _interval && window.clearInterval(_interval);
            var touchobj = e.changedTouches[0];
            touchstartPos.x = touchPos.x = touchobj.pageX;
            touchstartPos.y = touchPos.y = touchobj.pageY;
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
            // way1: {
            //     var offsetItemNumber = Math.round(offsetItemCount());
            //     _this.goto(offsetItemNumber);
            // }
            
            way2: {
                var touchobj = e.changedTouches[0],
                    touchendPos = { x: 0, y: 0 };
                var touchendTime = Date.now();
                touchendPos.x = touchobj.pageX;
                touchendPos.y = touchobj.pageY;
                
                (function () {
                    if (touchendTime - touchstartTime < 500) {
                        if (dir === 'h') {
                            _this.move(touchendPos.x - touchstartPos.x < 0 ? 1 : -1);
                            return;
                        } else if (dir === 'v') {
                            _this.move(touchendPos.y - touchstartPos.y < 0 ? 1 : -1);
                            return;
                        }
                    }
                    if (dir === 'h' && Math.abs(touchendPos.x - touchstartPos.x) > containerSize.w / 2) {
                        _this.move(touchendPos.x - touchstartPos.x < 0 ? 1 : -1);
                        return;
                    } else if (dir === 'v' && Math.abs(touchendPos.y - touchstartPos.y) > containerSize.h / 2) {
                        _this.move(touchendPos.y - touchstartPos.y < 0 ? 1 : -1);
                        return;
                    }
                    
                    _this.move(0);
                })();
            }
        }, false);
    }

    var disableDuration = function () {
        $items.style.transition = $items.style.WebkitTransition = '';
    };
    var enableDuration = function (r) {
        r = r || 1;
        $items.style.transition = $items.style.WebkitTransition = 'all ' + ((transDuration/r)/1000) + 's ease';
    };

    this.current = function () {
        return $container.querySelector('.items>.item:nth-child(' + this.__cur + ')');
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
                enableDuration(2);
                setHOffset(-size * containerSize.w);
                window.setTimeout(function () {
                    disableDuration();
                    setHOffset(containerSize.w);
                    window.setTimeout(function () {
                        enableDuration(2);
                        setHOffset(0);
                        window.setTimeout(function () { enableDuration(); }, transDuration / 2);
                        onmoved(_this.__cur, cur);
                    }, 0);
                }, transDuration);
            } else if (cur === 0 && step === -1) {
                _interval && window.clearInterval(_interval);
                enableDuration(2);
                setHOffset(containerSize.w);
                window.setTimeout(function () {
                    disableDuration();
                    setHOffset(-size * containerSize.w);
                    window.setTimeout(function () {
                        enableDuration(2);
                        setHOffset(-(size - 1) * containerSize.w);
                        window.setTimeout(function () { enableDuration(); }, transDuration / 2);
                        onmoved(_this.__cur, cur);
                    }, 0);
                }, transDuration);
            } else {
                setHOffset(-this.__cur * containerSize.w);
                onmoved(this.__cur, cur);
            }
        } else {
            if (cur === size - 1 && step === 1) {
                _interval && window.clearInterval(_interval);
                enableDuration(2);
                setVOffset(-size * containerSize.h);
                window.setTimeout(function () {
                    disableDuration();
                    setVOffset(containerSize.h);
                    window.setTimeout(function () {
                        enableDuration(2);
                        setVOffset(0);
                        window.setTimeout(function () { enableDuration(); }, transDuration / 2);
                        onmoved(_this.__cur, cur);
                    }, 0);
                }, transDuration);
            } else if (cur === 0 && step === -1) {
                _interval && window.clearInterval(_interval);
                enableDuration(2);
                setVOffset(containerSize.h);
                window.setTimeout(function () {
                    disableDuration();
                    setVOffset(-size * containerSize.h);
                    window.setTimeout(function () {
                        enableDuration(2);
                        setVOffset(-(size - 1) * containerSize.h);
                        window.setTimeout(function () { enableDuration(); }, transDuration / 2);
                        onmoved(_this.__cur, cur);
                    }, 0);
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
