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

## svg-sprite-loader
网上搜寻了一圈，解决方案是 —— [svg-sprite-loader](https://github.com/kisenka/svg-sprite-loader)

它的原理是:

