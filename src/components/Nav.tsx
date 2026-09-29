// Nav.tsx — 高亮项完全由当前路由推导，不保存任何"激活项"状态。
//
// ─────────────────────────────────────────────────────────────────────────
// 取舍之三：导航高亮不另存状态
// ─────────────────────────────────────────────────────────────────────────
// 点击导航时只改 hash，hashchange 回流到 useRouter() 的 path；这里渲染期用
// path === route.path 推出 aria-current / .active。好处：前进后退、手动改 URL、
// 深链打开、兜底页等所有入口的高亮都自动正确，不存在"状态与地址栏不同步"。
// 三项取舍之间没有冲突：本推导只依赖 routes.ts 的声明，与 hash/basename 决策
// （hash 恰好让 path 解析无需 basename）和主题状态完全解耦。

import { NAV_ROUTES } from '../routes'
import { Link, useRouter } from '../router'

export function Nav() {
  const { path } = useRouter()

  return (
    <nav className="nav" aria-label="主导航">
      {NAV_ROUTES.map((route) => {
        const active = route.path === path
        return (
          <Link
            key={route.path}
            to={route.path}
            className={active ? 'nav-item active' : 'nav-item'}
            aria-current={active ? 'page' : undefined}
          >
            {route.title}
          </Link>
        )
      })}
    </nav>
  )
}