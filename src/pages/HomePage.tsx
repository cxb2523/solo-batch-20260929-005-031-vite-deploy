import { Link } from '../router'

export function HomePage() {
  return (
    <section className="card">
      <h2>首页</h2>
      <p>
        这是由 <code>src/routes.ts</code> 单份声明驱动的多视图站点。路由表、导航项与
        页面标题共用同一份配置，新增视图只需在那一处加一条记录。
      </p>
      <p>
        当前 URL 形如 <code>/vite-deploy/#/about</code>：<code>#</code> 之后才是视图
        路径，深链刷新时服务器只取 index.html，不会 404。
      </p>
      <p className="actions">
        <Link className="button" to="/about">前往「关于」</Link>
        <Link className="button" to="/dashboard">前往「看板」</Link>
      </p>
    </section>
  )
}