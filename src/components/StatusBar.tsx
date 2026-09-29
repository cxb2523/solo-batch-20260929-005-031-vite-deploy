// StatusBar.tsx — 页脚验收状态栏（录屏肉眼核对用）。
// 显示：当前路由（含是否命中兜底）、主题偏好/生效/来源、localStorage 键与原始值。

import { useCurrentRoute } from '../router'
import { THEME_STORAGE_KEY, useTheme } from '../theme/ThemeContext'

export function StatusBar() {
  const { path, route } = useCurrentRoute()
  const { preference, resolved, source, storedValue } = useTheme()
  const isFallback = route.path === '*' && path !== '*'

  return (
    <footer className="status-bar" role="contentinfo">
      <span title="当前 hash 视图路径">
        路由：<code>{path}</code>
        {isFallback ? ' → 兜底页(*)' : ` → ${route.title}`}
      </span>
      <span>
        主题：{preference === null ? '未选择' : preference}（生效 {resolved}）
      </span>
      <span>
        来源：<strong>{source}</strong>
      </span>
      <span title={`localStorage 键「${THEME_STORAGE_KEY}」的当前原始值`}>
        存储：<code>{THEME_STORAGE_KEY}</code>=
        <code>{storedValue === null ? '∅(键不存在)' : `"${storedValue}"`}</code>
      </span>
    </footer>
  )
}