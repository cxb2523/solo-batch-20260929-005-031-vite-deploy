import type { ThemeChoice } from '../theme'

interface ThemeSwitcherProps {
  choice: ThemeChoice
  onChange: (choice: ThemeChoice) => void
}

const OPTIONS: Array<{ value: ThemeChoice; label: string }> = [
  { value: 'system', label: '未选择' },
  { value: 'light', label: '浅' },
  { value: 'dark', label: '深' },
]

export default function ThemeSwitcher({ choice, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher" role="group" aria-label="主题">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={choice === option.value ? 'theme-btn is-selected' : 'theme-btn'}
          aria-pressed={choice === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
