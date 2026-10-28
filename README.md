# 宝宝的生日惊喜

梦幻粉色生日网页。昵称：**宝宝**。

## 流程

1. 星空开场  
2. 3D 爱心  
3. 回忆照片墙（表格 / 球球 / 螺旋 / 格子）  
4. 蛋糕 / 吹蜡烛  
5. 倒数烟花  
6. **一封情书**（最终幕）：嵌入 [Awesome-Love-Code Web/003](https://sun0225sun.github.io/Awesome-Love-Code/Web/003/) 原版爱心树动画

整体视觉统一为 Web/003 的经典粉红（`#ffc0cb`）+ 微软雅黑/宋体气质。

## 第三方致谢

最终幕源码来自：

- 仓库：https://github.com/sun0225SUN/Awesome-Love-Code  
- 路径：`Web/003`  
- 许可证：**MIT**（Copyright (c) 2022 小孙同学）  
- 本地副本：`public/love003/`（含 `NOTICE.txt`）

照片墙交互参考同仓库 `Web/007` 的 CSS3D 布局思路，为原创实现。

## 技术栈

React + Vite · Three.js / R3F · GSAP · Web Audio

## 本地运行

```bash
cd D:\birthday-surprise
npm install
npm run dev
```

构建：`npm run build`

## 在线访问

部署到 GitHub Pages 后访问：

`https://<你的用户名>.github.io/birthday-surprise/`

推送到 `main` 分支后，GitHub Actions 会自动构建并发布。

## 自定义

- 文案 / 昵称：`src/data/content.js`
- 情书正文：`public/love003/index.html` 内 `#code`
- 相处计时起点：同文件中 `together.setFullYear(...)`
- 照片：`public/placeholders/`
