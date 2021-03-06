# YunpNodeServer
YunpNodeServer是一个简单的Nodejs应用服务器，是《[云加JavaScript](https://yunp.top/p/v/1)》用于全栈教学的课堂实现。

## 安装

```shell
npm install yns2
```

## Hello World
main.js 内容如下：  

```javascript
const Server = require("../../index");

let s = new Server();
s.serve();

s.addPage("/", async (req, res) => {
    await res.write(`Hello World`);
});

```

## Rendering a template  

```javascript  
const Server = require("../../index");
const path = require("path");

let s = new Server();
s.serve();

s.addPage("/", async (req, res) => {
    await res.render("index.twig", { name: "yunp" });
});  
```

## 运行

```shell
node main.js
```

## 查看效果

访问地址： http://localhost:9000   
效果如下：  
![screenshots/s1.jpg](screenshots/s1.jpg)
