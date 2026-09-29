import type { ThemeState } from '../useTheme'
import { THEME_STORAGE_KEY } from '../theme'
import { NOT_FOUND_TITLE } from '../routes'

interface StatusBarProps {
  path: string
  /** 命中导航路由时为其标题，null 表示已落兜底页。 */
  matchedTitle: string | null
  theme: ThemeState
}

const SOURCE_LABEL = {
  system: '跟随系统',
  user: '用户显式选择',
} as const

export default function StatusBar({ path, matchedTitle, theme }: StatusBarProps) {
  const routeLabel = matchedTitle ?? `${NOT_FOUND_TITLE}（兜底）`
  return (
    <footer className="site-footer">
      <dl className="status-bar">
        <div className="status-item">
          <dt>当前路由</dt>
          <dd>
            <code>#{path}</code>
            <span className="status-sep">→</span>
            <span>{routeLabel}</span>
          </dd>
        </div>
        <div className="status-item">
          <dt>主题</dt>
          <dd>
            <span>{theme.resolved === 'dark' ? '深色' : '浅色'}</span>
            <span className="status-sep">·</span>
            <span>来源：{SOURCE_LABEL[theme.source]}</span>
          </dd>
        </div>
        <div className="status-item">
          <dt>存储</dt>
          <dd>
            <code>{THEME_STORAGE_KEY}</code>
            <span className="status-sep">=</span>
            <code>{theme.stored === null ? '〈无键〉' : `"${theme.stored}"`}</code>
          </dd>
        </div>
      </dl>
    </footer>
  )
}
