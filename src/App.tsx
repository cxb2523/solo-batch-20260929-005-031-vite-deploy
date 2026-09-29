import { Nav } from './components/Nav'
import { StatusBar } from './components/StatusBar'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { useCurrentRoute } from './router'
import { APP_NAME } from './routes'

export default function App() {
  const { path, route } = useCurrentRoute()
  const View = route.component

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>{APP_NAME}</h1>
        <ThemeSwitcher />
      </header>
      <Nav />
      <main className="app-main">
        {/* key 带上 path，切换视图时干净地重新挂载 */}
        <View key={path} />
      </main>
      <StatusBar />
    </div>
  )
}