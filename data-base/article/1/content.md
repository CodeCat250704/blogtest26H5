# 关于Apple液态玻璃效果的web前端实现

---

Hello Everybody 我是Cat。今天我们来讲解Apple液态玻璃的实现，也是本站的创新点

---

## 什么是液态玻璃

**液态玻璃其实不是官方学名**
液态玻璃实际上是**毛玻璃背景模糊**。简单来说是一块背景图，上面蒙了一层半透明磨砂面。如图所示：
![](2.png)

**最终的效果如何**
![](1.png)

---

## 如何实现

1. 我们新建一个文件夹，名字叫`Frosted_glass`。
2. 在里面创建如下所示的文件夹及文件

```txt
/
├── index.html           # 【入口】液态玻璃的主入口
│
├── background.jpeg      # 【背景】全局唯一动态背景图（自己选择，后缀名不一样也行）
│
├── style.css            # 【样式】液态玻璃核心

```

3. index.html写最简单的盒子

**要是连这个也不会证明你没有任何前端基础，建议去哔哩哔哩从头开始学**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>毛玻璃</title>
    <!-- 引入外部 CSS 文件 -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- 为了看到毛玻璃效果，盒子后面必须要有背景内容 -->
    <div class="background">
        <div class="glass-box">
        </div>
    </div>
</body>
</html>
```

4. style.css写毛玻璃

```css
/* 给页面一个彩色背景，否则看不到毛玻璃的透光感 */
.background {
    width: 100%;
    height: 100vh;
    background: blue;
    display: flex;
    justify-content: center;
    align-items: center;
}

.glass-box {
    width: 300px;
    padding: 300px; 
    
    /* 1. 透明 */
    background: transparent;
    
    /* 2. 背景模糊，产生磨砂玻璃效果 */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px); /* 兼容 Safari */
    
    /* 3. 边框：半透明白色，产生发光边缘 */
    border: 1px solid rgba(255, 255, 255, 0.4);
    
    /* 4. 阴影：外部深邃 + 内边光 + 底高光反射 */
    box-shadow: 
        0 15px 35px rgba(0, 0, 0, 0.25),              /* 投影，浮框 */
        inset 0 1px 0px rgba(255, 255, 255, 0.6),     /* 顶边光 */
        inset 0 -1px 0px rgba(255, 255, 255, 0.2);    /* 底边光 */
}
```

用浏览器打开index.html就能看到毛玻璃效果了
![](image.png)
但是没有光泽，那么我们修改相关参数使其变得光泽

5. 加入背景图片，尽量花一点，效果更好，修改.background 

```css
.background {
    width: 100%;
    height: 100vh;
    /* 注意：这里不再是 blue，而是引入你的背景图 */
    background-image: url('你的图片链接'); 
    background-size: cover;          /* 保证图片铺满屏幕 */
    background-position: center;     /* 图片居中显示 */
    background-repeat: no-repeat;    /* 不平铺 */
}
```

6. 修改好后效果展示，这感觉不就来了吗
![](3.png)

---

以上就是今天的全部内容，如有错误请联系作者邮箱：xsh3304832000@163.com

---

应相关宣传需求，再次列出宣传名单
**关联人员**
1. CodeGin：博客地址：www.codegin.top
2. Adregim: 暂无方式