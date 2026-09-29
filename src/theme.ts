// 主题三态模型与持久化约定（与 src/useTheme.ts、index.html 中的 pre-paint
// 脚本配合使用）。
//
// ---- 取舍 3：未选择（跟随系统）如何落盘 ------------------------------------
// 只有用户显式选择 light / dark 时才写 localStorage；选择“跟随系统”时
// 直接删键。即“键是否存在”编码了“用户是否做过显式选择”，无需再存一个
// 来源标记。这样：
//   - 键不存在：未选择，实时跟随 prefers-color-scheme，系统切换立即生效；
//   - 键有值：来源为用户，系统配色再怎么变都不会覆盖它（见 useTheme 里
//     resolved = stored ?? systemTheme，stored 永远优先）。
//
// 注意：index.html <head> 内有一段同步脚本在首屏渲染前读取同一个键名回填
// data-theme（防刷新闪白）。浏览器原生脚本无法 import 本文件，因此键名在
// 那里是刻意的第二处声明，修改 THEME_STORAGE_KEY 时必须同步修改 index.html。

export type ThemePreference = 'light' | 'dark'

/** 'system' 即“未选择”：跟随系统配色。 */
export type ThemeChoice = ThemePreference | 'system'

/** 主题来源：user 仅当 localStorage 中存在显式值。 */
export type ThemeSource = 'system' | 'user'

export const THEME_STORAGE_KEY = 'vite-deploy:theme'

const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)'

function systemPrefersDark(): boolean {
  return window.matchMedia(PREFERS_DARK_QUERY).matches
}

/** 读取已落盘的显式选择；键缺失或值非法（含存储不可用）一律视为未选择。 */
export function readStoredChoice(): ThemePreference | null {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    return raw === 'light' || raw === 'dark' ? raw : null
  } catch {
    return null
  }
}

/** pref 为 null 表示删除键值（回到未选择 / 跟随系统）。 */
export function writeStoredChoice(pref: ThemePreference | null): void {
  try {
    if (pref === null) {
      window.localStorage.removeItem(THEME_STORAGE_KEY)
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, pref)
    }
  } catch {
    // 隐私模式等写入失败时静默降级：本次会话内仍可切换，只是不落盘。
  }
}

export function resolveSystemTheme(): ThemePreference {
  return systemPrefersDark() ? 'dark' : 'light'
}

/** 把最终生效的主题写到 <html> 上，驱动 CSS 变量与原生控件配色。 */
export function applyTheme(theme: ThemePreference): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
}

/** 订阅系统配色变化，返回取消订阅函数。 */
export function watchSystemTheme(handleChange: () => void): () => void {
  const media = window.matchMedia(PREFERS_DARK_QUERY)
  media.addEventListener('change', handleChange)
  return () => media.removeEventListener('change', handleChange)
}
