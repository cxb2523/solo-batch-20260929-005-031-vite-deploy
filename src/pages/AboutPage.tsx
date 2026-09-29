export function AboutPage() {
  return (
    <section className="card">
      <h2>关于</h2>
      <p>
        三处工程取舍都写在注释里：hash 路由 vs basename（
        <code>src/routes.ts</code>）、主题三态如何落盘与防闪白（
        <code>src/theme/ThemeContext.tsx</code>）、导航高亮由当前路由推导（
        <code>src/components/Nav.tsx</code>）。
      </p>
      <ul>
        <li>导航高亮没有任何独立状态，渲染时拿当前 hash 路径逐条比对。</li>
        <li>主题三态：跟随系统 / 浅色 / 深色；只有显式选择才写 localStorage。</li>
        <li>未选择时跟随系统，系统切换外观实时生效；显式选择后系统变更不再覆盖。</li>
      </ul>
    </section>
  )
}