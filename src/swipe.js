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
    option.cssText = option.cssText || {};

    var loop = !!option.loop;
    var notAuto = !!option.notAuto;
    var dir = (option.direction === 'v') ? 'v' : 'h';
    var duration = option.duration || 3000;
    var transDurationDefault = 300;
    var transDuration = option.transDuration || transDurationDefault;
    var parentSelector = option.parentSelector || ('swipe_' + Math.floor(Math.random() * 10000));
    var _this = this;

    this.__cur = option.initIndex || 0;
    this.current = function () {
        return $container.querySelector('.items>.item:nth-child(' + this.__cur + ')');
    };
    this.size = function () {
        return $container.querySelectorAll('.items>.item').length;
    };
    var _this_size = _this.size();
    
    ensure_styles: {
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
    
    var $items = null;
    var $indicators = null;

    ensure_elements: {
        $container.className += ' ' + parentSelector + ' swipe-container ' + (dir === 'h' ? 'swipe-container-h' : 'swipe-container-v');
        
        $items = $container.querySelector('.items');
        $items.style.cssText += '-webkit-transition:all ' + (transDuration/1000) + 's ease;transition:all ' + (transDuration/1000) + 's ease;';
        option.cssText.item && addCssRule('.' + parentSelector + ' .item', option.cssText.item);
        
        $indicators = document.createElement('div');
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

    var offset = { x: 0, y: 0 };
    var containerSize = { w: 0, h: 0 };
    
    var setHOffset = function (v) {
        if (!loop) v = v > 0 ? 0 : ((v < (1 - _this_size) * containerSize.w) ? ((1 - _this_size) * containerSize.w) : v);
        offset.x = v;
        $items.style.transform = $items.style.WebkitTransform = 'translate3d(' + v + 'px,0,0)';
    };
    var setVOffset = function (v) {
        if (!loop) v = v > 0 ? 0 : ((v < (1 - _this_size) * containerSize.h) ? ((1 - _this_size) * containerSize.h) : v);
        offset.y = v;
        $items.style.transform = $items.style.WebkitTransform = 'translate3d(0,' + v + 'px,0)';
    };
    var offsetItemCount = function () {
        return dir === 'h' ? (-offset.x / containerSize.w) : (-offset.y / containerSize.h);
    };

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

    interval: {
        var _interval = null;
        var interval = function () {
            if (notAuto) return;
            _interval && window.clearInterval(_interval);
            _interval = window.setInterval(function () {
                _this.move(1);
            }, duration);
        };
    }

    init: {
        syncIndicator();
        containerSize.w = $container.clientWidth,
        containerSize.h = $container.clientHeight;
        dir === 'h' ? setHOffset(0 - this.__cur * containerSize.w) : setVOffset(0 - this.__cur * containerSize.h);
        interval();
    }

    // var onmoving = option.onmoving || function () {};
    var onmoved = function () {
        interval();
        syncIndicator();
        option.onmoved && option.onmoved.apply(option, [].slice.call(arguments, 0));
    } || function () {};

    var disableDuration = function () {
        $items.style.transition = $items.style.WebkitTransition = 'none';
    };
    var enableDuration = function (r) {
        r = r || 1;
        $items.style.transition = $items.style.WebkitTransition = 'all ' + ((transDuration/r)/1000) + 's ease';
    };

    bind_events: {
        var touchPos        = { x: 0, y: 0 };
        var touchstartPos   = { x: 0, y: 0 };
        var touchstartTime  = 0;
        $items.addEventListener('touchstart', function (e) {
            _interval && window.clearInterval(_interval);
            var touchobj = e.changedTouches[0];
            touchstartPos.x = touchPos.x = touchobj.pageX;
            touchstartPos.y = touchPos.y = touchobj.pageY;
            touchstartTime = Date.now();
            disableDuration();
            _this_size = _this.size();
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
            enableDuration();
            
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
                            _this.move((touchendPos.x - touchstartPos.x < 0) ? 1 : -1);
                            return;
                        } else {
                            _this.move((touchendPos.y - touchstartPos.y < 0) ? 1 : -1);
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

    var specAction = function (d, cur, s1, s2, s3) {
        var setOffset = d === 'h' ? setHOffset : setVOffset;
        _interval && window.clearInterval(_interval);
        enableDuration(2);
        setOffset(s1);
        window.setTimeout(function () {
            disableDuration();
            setOffset(s2);
            window.setTimeout(function () {
                enableDuration(2);
                setOffset(s3);
                window.setTimeout(function () { enableDuration(); }, transDuration / 2);
                onmoved(_this.__cur, cur);
            }, 20);
        }, transDuration);
    };
    this.move = function (step) {
        var size = this.size(),
            cur = this.__cur;
        if (cur + step >= size) {
            if (!loop) return;
            this.__cur = 0;
        } else if (cur + step < 0) {
            if (!loop) return;
            this.__cur = size - 1;
        } else {
            this.__cur = cur + step;
        }
        var baseStep = containerSize[dir === 'h' ? 'w' : 'h'];
        if (cur === size - 1 && step === 1) {
            specAction(dir, cur, -size * baseStep, baseStep, 0);
        } else if (cur === 0 && step === -1) {
            specAction(dir, cur, baseStep, -size * baseStep, -(size - 1) * baseStep);
        } else {
            (dir === 'h' ? setHOffset : setVOffset)(-this.__cur * baseStep);
            onmoved(this.__cur, cur);
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
