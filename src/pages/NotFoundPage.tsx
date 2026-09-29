import { Link } from '../router'

export function NotFoundPage() {
  return (
    <section className="card">
      <h2>404</h2>
      <p>当前 hash 路径没有匹配到任何已声明视图，已落入兜底页（来自 <code>path: '*'</code>）。</p>
      <p className="actions">
        <Link className="button" to="/">回到首页</Link>
      </p>
    </section>
  )
}