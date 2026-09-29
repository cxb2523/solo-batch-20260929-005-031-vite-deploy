import { useTheme } from '../theme/ThemeContext'

export function DashboardPage() {
  const { preference, resolved, source } = useTheme()
  const rows: Array<[string, string]> = [
    ['用户偏好', preference === null ? '未选择（跟随系统）' : preference],
    ['实际生效', resolved],
    ['主题来源', source === 'user' ? '用户（本地存储）' : '系统（未选择）'],
  ]

  return (
    <section className="card">
      <h2>看板</h2>
      <p>这里展示当前主题的实时解析结果，用于和页脚状态栏交叉核对：</p>
      <table className="kv">
        <tbody>
          {rows.map(([key, value]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}