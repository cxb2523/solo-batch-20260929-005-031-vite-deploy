import { NAV_ROUTES } from '../routes'

interface NavProps {
  currentPath: string
}

export default function Nav({ currentPath }: NavProps) {
  return (
    <nav className="site-nav" aria-label="主导航">
      <ul>
        {NAV_ROUTES.map((route) => {
          // 高亮由当前 hash 路径直接推导，不存任何 active 状态（取舍 2）。
          const active = route.path === currentPath
          return (
            <li key={route.path}>
              <a
                href={`#${route.path}`}
                className={active ? 'nav-link is-active' : 'nav-link'}
                aria-current={active ? 'page' : undefined}
              >
                {route.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
