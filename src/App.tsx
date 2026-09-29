import { useEffect } from 'react'
import Nav from './components/Nav'
import StatusBar from './components/StatusBar'
import ThemeSwitcher from './components/ThemeSwitcher'
import {
  NOT_FOUND_TITLE,
  NotFoundView,
  SITE_NAME,
  matchRoute,
  setDocumentTitle,
} from './routes'
import { useHashPath } from './router'
import { useTheme } from './useTheme'
import './App.css'

export default function App() {
  const path = useHashPath()
  const theme = useTheme()
  const route = matchRoute(path)
  const matched = route !== null

  // 标题随当前路由更新；兜底页使用 NOT_FOUND_TITLE（全部来自 routes.tsx）。
  useEffect(() => {
    setDocumentTitle(matched ? route.title : NOT_FOUND_TITLE)
  }, [matched, route])

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="site-brand" href="#/">
          {SITE_NAME}
        </a>
        <Nav currentPath={path} />
        <ThemeSwitcher choice={theme.choice} onChange={theme.setChoice} />
      </header>

      <main className="site-main">{matched ? <route.View /> : <NotFoundView />}</main>

      <StatusBar path={path} matchedTitle={matched ? route.title : null} theme={theme} />
    </div>
  )
}
