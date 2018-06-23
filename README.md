# 懒人神器：svn-sprite-loader实现自己的Icon组件

> 用 svn-sprite-loader 解放你的icon.

好吧，这篇文章的起源就来源于——我懒。

UI小姐姐设计了自己的icon，但是我不想每次引入icon的时候都写一大堆:
```html
<img src="/long/path/to/your/svg/icon.svg" />
```

很长很长的地址…我觉得最简单的形式还是像饿了么那些UI库一样，直接：

```vue
<el-icon name="icon-file-name"></el-icon>
```

写个文件名就能引入我的icon了。

OK, 以上就是我们的理想模式。So, let’s go!

## 工作原理
网上搜寻了一圈，一个简单的解决方案是 —— svg 雪碧图。

它的工作原理是: **利用sag的`symbol`元素，将每个icon包括在`symbol`中，通过`use`元素使用该`symbol`**.

OK，如果你对此不了解，可以阅读张鑫旭老师的[这篇文章](https://www.zhangxinxu.com/wordpress/2014/07/introduce-svg-sprite-technology/).

我们这里简单一点的解释就是，最终你的svg icon会变成下面这个样子的 svg 雪碧图:

```html
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="__SVG_SPRITE_NODE__">
    <symbol class="icon" viewBox="0 0 1024 1024" id="icon名">{{省略的icon path}}</symbol>
    <symbol class="icon" viewBox="0 0 1024 1024" id="icon名">{{省略的icon path}}</symbol>
</svg>
```

你的每一个icon都对应着一个`symbol`元素。然后在你的html中，引入这样的svg, 随后通过`use`在任何你需要icon的地方指向symbol:
```html
<use xlink:href="#symbolId"></use>
```
这个过程中，我们可以把symbol理解为sketch中内置的图形，当你需要使用的时候，把这个形状”拖拽”到你的画板中就行了。而`use`就是这个过程中的”拖拽”行为。


## 工具
要让我们自己生成上面那样的svg雪碧图——肯定是不可能的咯！
恩，你一定想到了，肯定有工具！当然你最常用的应该是webpack的工具吧，这里拿好！

[svg-sprite-loader](https://github.com/kisenka/svg-sprite-loader)

`svg-sprite-loader`会把你的icon塞到一个个`symbol`中，`symbol`的id如果不特别指定，就是你的文件名。它最终会在你的`html`中嵌入这样一个`svg`，
你就可以像上面这样：
```html
<use xlink:href="#symbolId"></use>
```
随意使用你的icon咯。

`svg-sprite-loader`配置如下：
```js
{
  test: /\.svg$/,
  loader: 'svg-sprite-loader',
}
```

有一点需要注意的是，我们并不是所有的svg都要放在我们的雪碧图里，有的也许我就想当做图片用。这时候在我们的`webpack`配置中，我们需要对这两种svg区别对待。
首先，我们要把所有要作为icon的svg团结在一起，放在某个文件夹中，例如`assets/icons`。其他的svg就随你便啦。

然后对于想要用作图片的:

```js
{
  test: /\.svg$/,
  loader: 'file-loader',
  exclude: path.resolve(__dirname, './src/assets/icons') // 不带icon 玩
}
```

对于用作icon的:
```js
{
  test: /\.svg$/,
  loader: 'svg-sprite-loader',
  include: path.resolve(__dirname, './src/assets/icons') // 只带自己人玩
}
```
最后，这俩就分道扬镳啦。


## 组件化
OK, 我们的问题已经解决了一半，不用每次都写路径引入`svg`文件了。
但是。。。我们现在要每次都写
```html
<svg>
    <use xlink:href="#symbolId"></use>
</svg>
```
我！不！干！！！而且也没达到我们最初的目的。
所以，我们肯定把上面的那一坨写成一个组件咯：
```vue
<template>
  <svg :class="svgClass">
    <use :xlink:href="`#${name}`"></use>
  </svg>
</template>

<script>
  export default {
    name: 'icon',
    props: {
      name: {
        type: String,
        required: true,
      },
    },
  }
</script>
```

最后，你就达成目标，这样使用：
```vue
import 'your-icon.svg';
<icon name="your-icon-name"></icon>
```

如果你想修改图标的颜色，直接设置该元素的`fill`/`stroke`属性。如果设置了这些属性没有反应的话，emmm...可能需要你的设计师重新切图，同样是张鑫旭大佬
关于切图的[这篇文章](https://www.zhangxinxu.com/wordpress/2014/12/psd-icon-path-illustrator-svg-sprites-css3-font-face/)

## 引入所有Icon文件
上面我们的基本功能已经完成了，还有最后一个小小的问题——我每次引用一个文件的时候就得import一下，这肯定也不满足我们偷懒的最终目标。
不过，总会有人比你更懒，或者总会有人比你先懒。在这里，我们可以使用webpack的[require.context](https://webpack.js.org/guides/dependency-management/#require-context)API来动态引入你所有的Icon.

现在我们是不能动态引入模块，但是web pack为我们提供了相关功能，[webpack]([Dependency Management](https://webpack.js.org/guides/dependency-management/)) 允许我们使用表达式动态引入模块。比如：`require('./template/' + name + '.ejs');`，此时web pack会生成一个`context module`

> A context module is generated. It contains references to all modules in that directory that can be required with a request matching the regular expression. The context module contains a map which translates requests to module ids.

它会被抽象成以下信息：
```
{
  "./table.ejs": 42, // key 是module, value 是module id
  "./table-row.ejs": 43,
  "./directory/folder.ejs": 44
}
```

因此，我们可以利用web pack提供的的[`require.context`]([Dependency Management](https://webpack.js.org/guides/dependency-management/#require-context)API 来创建自己的`context module`动态引入icon。它接受三个参数，第一个是文件夹，第二个是是否使用子文件，第三个是文件匹配的正则。
`require.context(directory, useSubdirectories = false, regExp = /^\.\//)`
对于我们的项目来说，我们需要动态引入的就是`require.context('./src/assets/icons', false, /\.svg/)`.

`require.context`会返回一个函数，并且该函数有`keys()`，`id`， `resolve() `属性。
- `keys()`方法返回的该模块可以处理的所有可能请求的模块的数组，简单一点就是满足该参数的模块；
- `resolve()`返回的是请求的module的id;
- `id`是该`context module`的id;

总的来说，就是说`require.context`帮我们创建一个上下文，比如在这里我们的上下文就是`./src/assets/icons`, 随后我们就可以通过`request.resolve('./store.svg')`来引入该上下文内的文件了。

我们打印一下:
```
const request = require.context('./assets/icons', false, /\.svg$/);
console.log(request);
console.log(request.keys());
console.log(request.id);
console.log('request.resolve()', request.resolve('./store.svg'));
console.log(request.resolve);

```

得到的结果是：

```js
// request
webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}

// request.keys()
["./airbloom.svg", "./crown.svg", "./store.svg"]

// request.id
./src/assets/icons sync \.svg$

// request.resolve('./store.svg');
./src/assets/icons/store.svg

// request.resolve
webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
```

有关的源码在这里：
```js
var map = {
	"./airbloom.svg": "./src/assets/icons/airbloom.svg",
	"./crown.svg": "./src/assets/icons/crown.svg",
	"./store.svg": "./src/assets/icons/store.svg"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./src/assets/icons sync \\.svg$";
```

最后，我们`request`该`context module`下的每一个`module`，引入我们所有的icon
```js
// 由于request返回了一个函数，该函数接收req作为参数，在这里其实我们就是把request.keys()中的每一个module传入了request的返回函数中了
request.keys().forEach(request);
```

## 总结
- 原理：
	- `symbol` + `use:xlink:href`;
	- `svg-sprite-loader`生成雪碧图;
	- `require.context`动态引入所有文件；

- 优化SVG
有时候，设计师切的icon并不那么geek, 有很多多余的东西，可以使用大名鼎鼎的[svgo](https://github.com/svg/svgo)进行优化，
它提供web在线版，web pack loader等。

- 其他工具
[vue-svgicon](https://github.com/MMF-FE/vue-svgicon)这款工具相比我们的有更多的feature，比如动画、方向等。它会给每个icon生成一个相对应的js文件，
用来注册这个icon。就我目前的应用场景来说，1. 它会生成很多js文件；2.每次新增一个svg时我就得run一次注册组件的命令。对于我现在的简单应用场景来说，并没有自己写的简单方便。
不过在其他的时候，他也可以作为另一个选择。

- 相关代码已经放在[github](https://github.com/Yawenina/svg-sprite-icon)上啦
- 本来想放在[codesandbox](https://codesandbox.io/)上的，结果目前他们[还不支持](https://github.com/CompuIves/codesandbox-client/issues/723)
`require.context`API.

## 参考资料
- [手摸手，带你优雅的使用 icon - 掘金](https://juejin.im/post/59bb864b5188257e7a427c09)
- [未来必热：SVG Sprite技术介绍 «  张鑫旭-鑫空间-鑫生活](https://www.zhangxinxu.com/wordpress/2014/07/introduce-svg-sprite-technology/)
- [PSD小图标变身SVG Sprites/font-face历险记 «  张鑫旭-鑫空间-鑫生活](https://www.zhangxinxu.com/wordpress/2014/12/psd-icon-path-illustrator-svg-sprites-css3-font-face/)
- [Webpack Dependency Management](https://webpack.js.org/guides/dependency-management/)

