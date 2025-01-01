
# 以下为本站所带有的功能与特性
###### ***为了让网站看起来正式点，下面列出了看起来很简单，实际上一点也不难的功能来滥竽充数。***

## 1. 多语言切换

> 本站支持在不同语种之间的切换操作，第一次访问时将会把浏览器语言设为默认语言。

本站当前支持的语言如下所示：

1. 中文
2. English

## 2. 静态网页的路由映射

> 所有路径 (Path) 访问均由 `route.js` 进行控制处理，该操作模仿了后端系统对于路径控制的行为。

*您可以通过这里查看 `[route.js](/JavaScript/General/route.js)` 的代码，或访问 [GitHub](https://github.com/SeeChen/seechen.github.io/blob/main/JavaScript/General/route.js) 查看代码的实现。*

## 3. 伪动态网站的使用

> 所有数据都以静态文件（如 JSON、TXT 等）的形式存储在 GitHub 存储库中。只有访问相关数据时才会获取和解析内容，模拟前后端交互。
