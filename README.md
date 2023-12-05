# evernote-china-exporter

### 使用方法

### 导出原始数据

> 我的电脑环境是 MacBook Pro / 2.3 GHz 双核 Intel Core i5 / NodeJS v20.10.0

需要提前申请开发者 Token - https://dev.yinxiang.com/doc/articles/dev_tokens.php

```bash
# 拉取本项目
git clone https://github.com/mylhyz/evernote-china-exporter.git
# 安装依赖
cd evernote-china-exporter
yarn install
# 执行主程序
export EVERNOTE_API_TOKEN=<你自己申请的token>
node main.js
```

发生报错一般是由于超时，比如，

```
ThriftException {
  errorCode: 19,
  message: null,
  rateLimitDuration: 3009
}
```

等待 rateLimitDuration 的秒数后重试即可，本项目有对已经拉取的笔记进行缓存

### 转换导出格式

在 `converter` 下是用于将导出的原始数据进行转换的代码，目前支持导出 html，markdown

```bash
cd converter
node main.js <evernote-china-exporter/exported 的路径>

#或者添加环境变量打印出所有笔记本和笔记标题
LOG_ENABLE=1 node main.js <evernote-china-exporter/exported 的路径>
```

默认的导出文件夹是

```
# html
.exported-html-cache
# markdown
.exported-markdown-cache
```
