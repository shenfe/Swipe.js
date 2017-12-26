# lite-swiper
A lightweight swiper component for mobile frontend.

## Demo
[Demo](http://shenfe.github.io/repos/lite-swiper/demo.html)

## Usage

```bash
npm install lite-swiper --save
```

### elements
Ensure a container with [`width`, `height`, `overflow`] styles, an item wrapper, and several items:

```html
<style>
    .container {
        width: 100%;
        height: 200px;
        overflow: hidden;
    }
</style>
<div id="my-swiper" class="container">
    <div class="items">
        <div class="item">item1</div>
        <div class="item">item2</div>
        <div class="item">item3</div>
    </div>
</div>
```

### script
Create an instance like this:

```js
var Swipe = require('lite-swiper');
var $target = document.getElementById('my-swiper');
var mySwiper = new Swipe($target, {
    cssText: {
        item: '',
        indicators: '',
        indicator: '',
        indicatorCurrent: ''
    },
    onmoved: function (index, indexBefore) {
        console.log(`moved from ${indexBefore} to ${index}`);
    }
});
```
## License
MIT
