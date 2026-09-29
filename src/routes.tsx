import type { ComponentType } from 'react'

// ===========================================================================
// 路由配置（本文件是路由表、导航项、页面标题与兜底页的“唯一声明处”）
//
// 新增一个视图：在本文件里加一个视图组件 + 在 ROUTES 数组里加一行，
// 导航渲染、标题更新、高亮推导、兜底匹配全部自动生效，应用其余代码无需改动。
// ===========================================================================

// ---- 取舍 1：hash 路由 vs history API + basename ---------------------------
// 站点要部署到静态托管的子路径（vite.config.ts 的 base: '/vite-deploy/'，
// 典型场景：GitHub Pages 项目页 https://user.github.io/vite-deploy/）。
//
// history API（basename: '/vite-deploy/'）方案下，深链
//   https://host/vite-deploy/about
// 刷新时请求的是该路径对应的真实文件，静态服务器只有 404 可给，必须另行
// 配置 SPA fallback（GitHub Pages 项目页根本不支持把任意路径回退到
// index.html，社区只能靠 404.html hack）。
//
// hash 路由把路径放在 # 之后：
//   https://host/vite-deploy/#/about
// # 左侧永远是真实存在的 index.html，任何静态托管（GitHub Pages / OSS /
// Nginx / S3）刷新深链都不会 404，零服务端配置，且与 vite 的 base 完全
// 正交——换部署子路径时路由层一行都不用动。
//
// 代价：URL 里多个 '#'、服务端/SEO 拿不到 fragment。本项目是需肉眼录屏
// 验收的内部多视图站点，不是面向爬虫的内容站，这些代价可接受。
// 结论：选 hash 路由，basename 仅由 vite 的 asset base 承担，不参与路由。
//
// ---- 取舍 2：导航高亮不另存状态 -------------------------------------------
// 高亮项不是一个独立 state（没有 onNavigate 时手动 setActive 之类），而是
// 在渲染时用当前 hash 路径在 ROUTES 上现算（见 App.tsx）。前进/后退、
// 刷新、深链直达、手改地址栏都天然同步，且不会出现“URL 变了高亮没跟上”
// 的双状态不一致问题。
//
// ---- 取舍 1/2/3 的联动与最终立场 ------------------------------------------
// 三件事都围绕“URL / 存储 是唯一事实来源”：
//   - 路由视图与导航高亮：唯一事实来源是 location.hash（本文件声明路由，
//     router.ts 只负责订阅 hash，App 渲染时推导高亮，不缓存）；
//   - 主题：唯一事实来源是 localStorage 的“有/无”键 + 系统媒体查询
//     （theme.ts / useTheme.ts），同样不引入第二份可漂移的状态；
//   - 正因为 hash 路由不依赖服务端重写，深链刷新与首屏主题回填可以分别
//     独立工作：index.html 的同步脚本只处理主题，hash 由浏览器原样保留，
//     两者互不牵制。
// 若未来站点转为面向 SEO 的公开站点，应整体切回 history API + basename，
// 并在托管侧补 SPA fallback，而不是两种路由混用。
// ===========================================================================

export interface RouteDef {
  /** hash 路径，'/' 为首页；始终以 '/' 开头。 */
  path: string
  /** 导航与 document.title 共用的页面标题（title 在 App 中拼站点后缀）。 */
  title: string
  /** 是否出现在顶部导航；false 表示有路由但无导航入口（预留给详情页等）。 */
  showInNav: boolean
  View: ComponentType
}

export const SITE_NAME = 'Vite 多视图演示'

function HomeView() {
  return (
    <section>
      <h2>首页</h2>
      <p>
        这是由一份路由配置驱动的多视图站点。路由表、导航项与页面标题都声明在
        <code> src/routes.tsx </code>
        中，新增视图只需在那里加一行。
      </p>
      <p>试着点击顶部导航切换视图，或直接访问 <code>#/about</code>。</p>
    </section>
  )
}

function AboutView() {
  return (
    <section>
      <h2>关于</h2>
      <p>本演示覆盖三件事：配置驱动的 hash 路由、三态主题、以及页脚验收状态栏。</p>
      <ul>
        <li>深链（如 <code>#/about</code>）刷新不会 404，无需服务端配置。</li>
        <li>导航高亮由当前 hash 路径实时推导，未单独保存任何状态。</li>
        <li>未知路径会落到兜底页，并可一键返回首页。</li>
      </ul>
    </section>
  )
}

function SettingsView() {
  return (
    <section>
      <h2>设置</h2>
      <p>主题切换控件在右上角：未选择（跟随系统）、浅、深三态。</p>
      <ul>
        <li>“未选择”不落盘，实时跟随系统配色，系统切换会立即生效。</li>
        <li>显式选择浅/深后写入 localStorage，刷新后保留，且系统变更不再覆盖。</li>
        <li>主题在首屏渲染前由 index.html 中的同步脚本回填，刷新深色不会闪白。</li>
      </ul>
    </section>
  )
}

export const ROUTES: RouteDef[] = [
  { path: '/', title: '首页', showInNav: true, View: HomeView },
  { path: '/about', title: '关于', showInNav: true, View: AboutView },
  { path: '/settings', title: '设置', showInNav: true, View: SettingsView },
]

export const NAV_ROUTES: RouteDef[] = ROUTES.filter((route) => route.showInNav)

/** 兜底页标题；同样在本文件声明，标题逻辑仍只有一处出口。 */
export const NOT_FOUND_TITLE = '页面不存在'

export function NotFoundView() {
  return (
    <section>
      <h2>404 · {NOT_FOUND_TITLE}</h2>
      <p>当前 hash 路径没有匹配的路由配置。</p>
      <p>
        <a href="#/">返回首页</a>
      </p>
    </section>
  )
}

/** 路径 → 路由配置；未命中返回 null，由调用方渲染兜底页。 */
export function matchRoute(path: string): RouteDef | null {
  return ROUTES.find((route) => route.path === path) ?? null
}

/** 仅设置 document.title；站点后缀在这里统一拼接。 */
export function setDocumentTitle(pageTitle: string): void {
  document.title = `${pageTitle} · ${SITE_NAME}`
}
