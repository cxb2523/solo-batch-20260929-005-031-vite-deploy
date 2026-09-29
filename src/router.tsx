// router.tsx — 极简 hash 路由运行时，与 src/routes.ts 的声明配合。
//
// 为什么不用 history API / basename：见 routes.ts 顶部的取舍注释，结论是静态
// 托管子路径下用 hash 路由换零配置深链刷新，路由层不感知 basename。
//
// 导航高亮不在此保存任何状态：usePath() 返回的当前路径是唯一事实来源，
// Nav 渲染时直接推导高亮项。

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { matchRoute, APP_NAME } from './routes'

/** 从 location.hash 解析视图路径：'#/about?x=1' -> '/about'。 */
export function getCurrentPath(): string {
  const hash = window.location.hash.replace(/^#/, '')
  const path = hash.split('?')[0]
  if (path === '' || path === '/') return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function navigate(path: string): void {
  const normalized = path.startsWith('/') ? path : `/${path}`
  // 同路径重复点击不做无意义跳转；其余一律改 hash，由 hashchange 驱动更新。
  if (normalized === getCurrentPath()) return
  window.location.hash = normalized
}

interface RouterContextValue {
  path: string
  navigate: (path: string) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() =>
    typeof window === 'undefined' ? '/' : getCurrentPath(),
  )

  useEffect(() => {
    const onChange = () => setPath(getCurrentPath())
    window.addEventListener('hashchange', onChange)
    // 进站时若 URL 完全没有 hash（https://host/vite-deploy/），补成 '#/'，
    // 让此后所有导航都统一走 hash 规则。
    if (window.location.hash === '') window.location.hash = '/'
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  // 页面标题由当前路由推导，和导航共用 routes.ts 的同一份 title。
  useEffect(() => {
    const route = matchRoute(path)
    document.title =
      route.path === '/' || route.path === '*'
        ? `${APP_NAME} · ${route.title}`
        : `${route.title} · ${APP_NAME}`
  }, [path])

  const value = useMemo(() => ({ path, navigate }), [path])

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter(): RouterContextValue {
  const context = useContext(RouterContext)
  if (!context) throw new Error('useRouter 必须在 <RouterProvider> 内使用')
  return context
}

/** 当前已匹配的路由记录（供状态栏与主视图渲染使用）。 */
export function useCurrentRoute() {
  const { path } = useRouter()
  return { path, route: matchRoute(path) }
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
}

/** hash 路由链接：href 写成 '#/path'，中键/新标签页打开也天然可用。 */
export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // 保留修饰键点击（新标签页等）与 preventDefault 的默认语义。
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      onClick?.(event)
      return
    }
    event.preventDefault()
    navigate(to)
    onClick?.(event)
  }

  return (
    <a href={`#${to.startsWith('/') ? to : `/${to}`}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}