// ThemeContext.tsx — 三态主题：未选择(null=跟随系统) / 浅色 / 深色。
//
// ─────────────────────────────────────────────────────────────────────────
// 取舍之二：三态如何落盘，以及"刷新不闪白"与"系统变更不覆盖已选值"如何兼得
// ─────────────────────────────────────────────────────────────────────────
// - localStorage 只在用户【显式切换】到浅色/深色时写入；"跟随系统"对应把键
//   删除（读不到键就是未选择态）。这样读取到的来源只有两种：user（有键且
//   合法）或 system（无键/非法值），不需要再单独存一个来源标记。
// - 防闪白不能靠 React（React 在首屏之后才执行）：index.html <head> 里有一段
//   同步内联脚本，在首次绘制前读取【同一个键】并给 <html> 打上 data-theme。
//   注意：THEME_STORAGE_KEY 与内联脚本里的字符串必须逐字一致，改键两处都要改。
// - 系统配色变更（或运行时切换操作系统外观）只在来源为 system 时生效；用户
//   一旦显式选择，matchMedia 的 change 事件不再覆盖 <html>，直到用户主动切回
//   "跟随系统"（此时键被删除，来源恢复 system）。
//
// 与路由取舍（routes.ts 顶部）互不牵制：hash 与 history 的选择不影响主题落盘，
// 主题也不依赖部署 basename（localStorage 键按源存储，子路径不参与）。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

// 与 index.html 内联防白脚本中的键名保持逐字一致。
export const THEME_STORAGE_KEY = 'app.theme'

export type ThemePreference = 'light' | 'dark' | null
export type ResolvedTheme = 'light' | 'dark'
export type ThemeSource = 'system' | 'user'

const QUERY = '(prefers-color-scheme: dark)'

function readPreference(): ThemePreference {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    // 隐私模式等场景拿不到 localStorage，退化为跟随系统。
  }
  return null
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia(QUERY).matches ? 'dark' : 'light'
}

function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

interface ThemeContextValue {
  /** 未选择 = null；浅/深 = 用户显式值。 */
  preference: ThemePreference
  /** 实际生效的配色（null 时已解析为系统当前配色）。 */
  resolved: ResolvedTheme
  /** 来源：system=未选择跟随系统；user=本地存储中的用户选择。 */
  source: ThemeSource
  /** 状态栏展示用的存储原始值（null 表示键不存在）。 */
  storedValue: string | null
  setPreference: (next: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 首帧的 data-theme 已由 index.html 内联脚本打好；这里只需从同一处读出状态。
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [storedValue, setStoredValue] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)

  // 监听系统配色变化；仅在未选择态参与解析，用户选择不被覆盖。
  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) =>
      setSystem(event.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolved: ResolvedTheme = preference ?? system
  const source: ThemeSource = preference === null ? 'system' : 'user'

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // 跨标签页同步：另一个标签页改了主题，本页立刻对齐（包括删除键的情况）。
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return
      setPreferenceState(readPreference())
      setStoredValue(event.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      if (next === null) window.localStorage.removeItem(THEME_STORAGE_KEY)
      else window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // 写入失败也继续更新内存状态，只是刷新后会回到系统态。
    }
    setStoredValue(next === null ? null : next)
    setPreferenceState(next)
  }, [])

  const value = useMemo(
    () => ({
      preference,
      resolved,
      source,
      storedValue,
      setPreference,
    }),
    [preference, resolved, source, storedValue, setPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme 必须在 <ThemeProvider> 内使用')
  return context
}