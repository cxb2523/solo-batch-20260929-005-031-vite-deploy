import { useTheme, type ThemePreference } from '../theme/ThemeContext'

const OPTIONS: Array<{ value: ThemePreference; label: string; hint: string }> = [
  { value: null, label: '跟随系统', hint: '未选择：跟随系统配色' },
  { value: 'light', label: '浅色', hint: '显式选择浅色' },
  { value: 'dark', label: '深色', hint: '显式选择深色' },
]

export function ThemeSwitcher() {
  const { preference, source, setPreference } = useTheme()

  return (
    <div className="theme-switcher" role="group" aria-label="主题">
      {OPTIONS.map((option) => {
        const active = preference === option.value
        return (
          <button
            key={option.label}
            type="button"
            className={active ? 'theme-btn active' : 'theme-btn'}
            aria-pressed={active}
            title={option.hint}
            onClick={() => setPreference(option.value)}
          >
            {option.label}
          </button>
        )
      })}
      <span className="theme-source-badge" data-source={source}>
        来源：{source === 'user' ? '用户' : '系统'}
      </span>
    </div>
  )
}