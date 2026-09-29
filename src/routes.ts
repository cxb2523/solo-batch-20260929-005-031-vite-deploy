// routes.ts — 全站唯一一份路由声明。
//
// 路由表、导航项、页面标题三者共用同一个 ROUTES 数组：
//   - 路由匹配靠 path；
//   - 导航渲染遍历 inNav !== false 的项；
//   - document.title 取自 title。
// 新增视图时只需：1) 在这里加一条记录；2) import 对应组件。其余无需改动。
//
// ─────────────────────────────────────────────────────────────────────────
// 取舍之一：深链刷新 404 —— hash 路由 vs history API + basename，最终选 hash
// ─────────────────────────────────────────────────────────────────────────
// 本项目部署在静态托管的子路径下（见 vite.config.ts 的 base: "/vite-deploy/"）。
// history 路由（react-router 的 BrowserRouter、history.pushState 等）下，URL 是
// 真实路径，例如 https://host/vite-deploy/about。对该深链做整页刷新时，浏览器会
// 向服务器请求 /vite-deploy/about 这个文件，而静态托管（GitHub Pages 等）上只有
// /vite-deploy/index.html，于是 404。要救活它必须依赖服务端 rewrite/SPA fallback
// （把所有未知路径回退到 index.html），同时前端还要用 basename: "/vite-deploy/"
// 剥离前缀；换一个子路径部署就得同步改 basename，GitHub Pages 还没有官方 rewrite。
//
// hash 路由把视图路径放在 # 后面（https://host/vite-deploy/#/about），# 及之后的
// 部分永远不会发给服务器，任何深链刷新请求的都只是 /vite-deploy/index.html，因此：
//   1. 零服务端配置即可保证深链刷新不 404；
//   2. 与部署子路径天然解耦——basename 只交给 Vite 拼装静态资源 URL，路由层完全
//      不需要感知 basename，换目录部署只改 vite.config.ts 的 base；
//   3. 代价是 URL 里多一个 #、对 SEO 不友好。本项目是内部多视图工具站、需要录屏
//      验收，SEO 无关紧要，故最终站 hash 这一边。
//
// 另两处取舍（主题三态、导航高亮）各自独立，不与本决策互相牵制：
//   - 导航高亮直接由当前 path 在渲染期推导，见 components/Nav.tsx，不另存状态；
//   - 主题三态见 theme/ThemeContext.tsx 与 index.html 内联脚本。

import type { ComponentType } from 'react'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'

export interface RouteRecord {
  /** 视图路径，即 hash 中 # 之后的部分，一律以 / 开头。 */
  path: string
  /** 页面标题，渲染该路由时写入 document.title。 */
  title: string
  /** 视图组件。 */
  component: ComponentType
  /**
   * 是否出现在顶部导航；默认 true。
   * 兜底页等非实体视图显式设为 false，导航与高亮推导都会跳过它。
   */
  inNav?: boolean
}

export const APP_NAME = '多视图站点'

export const ROUTES: RouteRecord[] = [
  { path: '/', title: '首页', component: HomePage },
  { path: '/about', title: '关于', component: AboutPage },
  { path: '/dashboard', title: '看板', component: DashboardPage },
  { path: '*', title: '页面不存在', component: NotFoundPage, inNav: false },
]

/** 导航项 = 路由表过滤而来，不是另起的第二份声明。 */
export const NAV_ROUTES = ROUTES.filter((route) => route.inNav !== false)

/** 按当前路径解析路由；无实体匹配时回落到 path === '*' 的兜底项。 */
export function matchRoute(path: string): RouteRecord {
  const fallback = ROUTES.find((route) => route.path === '*')
  const matched = ROUTES.find(
    (route) => route.path !== '*' && route.path === path,
  )
  return matched ?? fallback ?? ROUTES[0]
}
