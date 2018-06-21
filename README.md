# 懒人神器：svg-sprite-loader实现自己的Icon组件

> 用 svg-sprite-loader 解放你的icon.

好吧，这篇文章的起源就来源于——我懒。

UI小姐姐设计了自己的icon，但是我不想每次引入icon的时候都写一大堆:
```
<img src="/long/path/to/your/svg/icon.svg" />
```

很长很长的地址…我觉得最简单的形式还是像饿了么那些UI库一样，直接：

```
<el-icon name="icon-file-name"></el-icon>
```

写个文件名就能引入我的icon了。

OK, 以上就是我们的理想模式。So, let’s go!

## 工作原理
网上搜寻了一圈，一个简单的解决方案是 —— svg 雪碧图。

它的工作原理是: **利用svg的`symbol`元素，将每个icon包括在`symbol`中，通过`use`元素使用该`symbol`**.

OK，如果你对此不了解，可以阅读张鑫旭老师的[这篇文章](https://www.zhangxinxu.com/wordpress/2014/07/introduce-svg-sprite-technology/).

我们这里简单一点的解释就是，最终你的svg icon会变成下面这个样子的svg 雪碧图:

```
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="__SVG_SPRITE_NODE__">
    <symbol class="icon" viewBox="0 0 1024 1024" id="icon名">{{省略的icon path}}</symbol>
    <symbol class="icon" viewBox="0 0 1024 1024" id="icon名">{{省略的icon path}}</symbol>
</svg>
```

你的每一个icon都对应着一个`symbol`元素。然后在你的html中，引入这样的svg, 随后通过`use`在任何你需要icon的地方指向symbol:
```
<use xlink:href="#symbolId"></use>
```
这个过程中，我们可以把symbol理解为sketch中内置的图形，当你需要使用的时候，把这个形状"拖拽"到你的画板中就行了。而`use`就是这个过程中的"拖拽"行为。


## 工具
要让我们自己生成上面那样的svg雪碧图——肯定是不可能的咯！
恩，你一定想到了，肯定有工具！当然你最常用的应该是webpack的工具吧，这里拿好！

[svg-sprite-loader](https://github.com/kisenka/svg-sprite-loader)

`svg-sprite-loader`会把你的icon塞到一个个`symbol`中，`symbol`的id如果不特别指定，就是你的文件名。它最终会在你的`html`中嵌入这样一个`svg`，
你就可以像上面这样：
```
<use xlink:href="#symbolId"></use>
```
随意使用你的icon咯。

`svg-sprite-loader`配置如下：
```
{
  test: /\.svg$/,
  loader: 'svg-sprite-loader',
}
```

有一点需要注意的是，我们并不是所有的svg都要放在我们的雪碧图里，有的也许我就想当做图片用。这时候在我们的`webpack`配置中，我们需要对这两种svg区别对待。
首先，我们要把所有要作为icon的svg团结在一起，放在某个文件夹中，例如`assets/icons`。其他的svg就随你便啦。

然后对于想要用作图片的:

```
{
  test: /\.svg$/,
  loader: 'file-loader',
  exclude: path.resolve(__dirname, './src/assets/icons') // 不带icon 玩
}
```

对于用作icon的:
```
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
```
<svg>
    <use xlink:href="#symbolId"></use>
</svg>
```
我！不！干！！！

