<div align="center">
    <h2>⚜️ V I T E &nbsp; D E P L O Y ⚜️</h2>
</div>

<div align="center">
    <h4>Follow the steps below to deploy your React application on GitHub.</h4>
    <a href="https://www.youtube.com/watch?v=XhoWXhyuW_I">
        <img src="https://img.shields.io/badge/Youtube_Video%20-%0A66C2.svg?&style=for-the-badge&logo=YouTube&logoColor=FF0000&color=282828" />
    </a>
</div>

<br />

#### 01. Create a vite react app
```npm
npm create vite@latest
```

#### 02. Create a new repository on GitHub and initialize GIT
```git
git init 
git add . 
git commit -m "add: initial files" 
git branch -M main 
git remote add origin https://github.com/[USER]/[REPO_NAME] 
git push -u origin main
```

#### 03. Setup base in *vite.config*
```js
base: "/[REPO_NAME]/"
```

#### 04. Create ./github/workflows/deploy.yml and add the code bellow
> [!WARNING]
> It is crucial that the `.yml` file has the exact code below. Any typing or spacing errors may cause deployment issues.
```yml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3

      - name: Install dependencies
        uses: bahmutov/npm-install@v1

      - name: Build project
        run: npm run build

      - name: Upload production-ready build files
        uses: actions/upload-artifact@v3
        with:
          name: production-files
          path: ./dist

  deploy:
    name: Deploy
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: production-files
          path: ./dist

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 05. Push to GitHub
```git
git add . 
git commit -m "add: deploy workflow" 
git push
```

#### 06. Active workflow (GitHub)
```
Config > Actions > General > Workflow permissions > Read and Write permissions 
```
```
Actions > failed deploy > re-run-job failed jobs 
```
```
Pages > gh-pages > save
```

## 🛠 Helper

#### > For code changes
Whenever you push to GitHub, it will deploy automatically.
```git
git add . 
git commit -m "fix: some bug" 
git push
```

#### > Fixing the 404 page error on routes.
Watch my video on YouTube or check my repository.

<a href="https://youtu.be/uEEj2c3_ydg?si=XiUEL9h1WUmfjtkt">
    <img src="https://img.shields.io/badge/Video%20-%0A66C2.svg?&style=for-the-badge&logo=YouTube&logoColor=FF0000&color=282828" />
</a>
<a href="https://github.com/ErickKS/vite-react-router">
    <img src="https://img.shields.io/badge/Repository%20-%0A66C2.svg?&style=for-the-badge&logo=GitHub&logoColor=FFFFFF&color=282828" />
</a>

<br/>

#### > Do you want to automate the project setup process ( `.yml` and `vite.config` )?
To prevent possible errors in the deploy process, check out this pull request:

<a href="https://github.com/ErickKS/vite-deploy/pull/1">
    <img src="https://img.shields.io/badge/Pull_Request%20-%0A66C2.svg?&style=for-the-badge&logo=GitHub&logoColor=FFFFFF&color=282828" />
</a>

---

## 多视图站点说明（路由 / 主题 / 状态栏）

- `npm run dev`：开发服地址为 `http://localhost:5173/vite-deploy/`（跟随 `vite.config.ts` 的 `base`）。
- `npm run build`：`tsc && vite build`，类型零报错方可通过。
- 新增视图：只改 `src/routes.tsx`（加视图组件 + `ROUTES` 加一行），导航、高亮、标题自动生效。
- 路由采用 hash 模式（如 `/vite-deploy/#/about`），静态托管深链刷新不会 404；hash vs basename 的取舍写在 `src/routes.tsx` 顶部注释。
- 主题三态：`未选择（跟随系统）/ 浅 / 深`，存储键 `vite-deploy:theme`，仅显式选择才落盘，`index.html` 在首屏渲染前同步回填。

### 录屏手验清单

1. 切路由：点击“首页 / 关于 / 设置”，导航高亮、页脚“当前路由”、浏览器标签标题三者同步；浏览器前进/后退同样同步。
2. 主题：选“深”→ 刷新，主题保留、页脚来源显示“用户显式选择”、存储显示 `"dark"`，且首屏不闪白；再改系统配色，页面不跟随。
3. 未选择：选“未选择”→ 存储显示“〈无键〉”，来源转为“跟随系统”，切换系统深/浅页面立即跟随。
4. 兜底：访问 `#/no-such-page`，无任何导航高亮，主区显示 404 兜底页，标题为“页面不存在”。
5. 页脚状态栏始终展示：当前 hash 路径与匹配标题、主题生效值与来源、存储键与键值。
