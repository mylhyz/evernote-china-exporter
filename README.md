# evernote-china-exporter

### 使用方法

> 我的电脑环境是 MacBook Pro / 2.3 GHz 双核 Intel Core i5 / NodeJS v20.10.0

需要提前申请开发者 Token - https://dev.yinxiang.com/doc/articles/dev_tokens.php

```bash
# 拉取本项目
git clone https://github.com/mylhyz/evernote-china-exporter.git
# 执行主程序
cd evernote-china-exporter
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