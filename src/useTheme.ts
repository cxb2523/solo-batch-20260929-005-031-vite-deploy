import { useCallback, useEffect, useState } from 'react'
import {
  type ThemeChoice,
  type ThemePreference,
  type ThemeSource,
  THEME_STORAGE_KEY,
  applyTheme,
  readStoredChoice,
  resolveSystemTheme,
  watchSystemTheme,
  writeStoredChoice,
} from './theme'

export interface ThemeState {
  /** 当前三态选择：未选择为 'system'。 */
  choice: ThemeChoice
  /** 真正生效的浅/深（未选择时等于系统值）。 */
  resolved: ThemePreference
  /** 来源：显式落盘为 'user'，否则为 'system'。 */
  source: ThemeSource
  /** localStorage 中的原始值（null 即键不存在），供状态栏展示键值。 */
  stored: ThemePreference | null
  /** 切换三态；'system' 会删键，浅/深会落盘。 */
  setChoice: (choice: ThemeChoice) => void
}

export function useTheme(): ThemeState {
  const [stored, setStored] = useState<ThemePreference | null>(readStoredChoice)
  const [systemTheme, setSystemTheme] = useState<ThemePreference>(resolveSystemTheme)

  // 系统配色变化：未选择时立即跟随；已有显式选择时不受影响。
  useEffect(
    () =>
      watchSystemTheme(() => {
        setSystemTheme(resolveSystemTheme())
      }),
    [],
  )

  // 跨标签页同步（其他标签页落盘/删键后本页跟随）。
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setStored(readStoredChoice())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const resolved: ThemePreference = stored ?? systemTheme

  // 生效值变化即同步到 <html data-theme>（首屏已由 index.html 脚本回填，
  // 此处处理挂载后的一切切换，不承担防闪白职责）。
  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  const setChoice = useCallback((choice: ThemeChoice) => {
    const nextStored = choice === 'system' ? null : choice
    writeStoredChoice(nextStored)
    setStored(nextStored)
  }, [])

  return {
    choice: stored ?? 'system',
    resolved,
    source: stored === null ? 'system' : 'user',
    stored,
    setChoice,
  }
}
