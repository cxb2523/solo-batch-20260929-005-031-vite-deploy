// 极简 hash 路由：只订阅 location.hash，不持有任何“当前页”之外的状态。
// 选 hash 方案的理由见 src/routes.tsx 顶部“取舍 1”的注释。

import { useSyncExternalStore } from 'react'

/** 从 location.hash 取路径：'' / '#/' / '#/about' 都规整为以 '/' 开头。 */
export function getHashPath(): string {
  const raw = window.location.hash
  if (!raw.startsWith('#')) {
    return '/'
  }
  const path = raw.slice(1)
  return path.startsWith('/') ? path : '/'
}

/** 编程式导航；直接改 hash 即可，hashchange 会驱动重新渲染。 */
export function navigate(path: string): void {
  window.location.hash = path
}

function subscribe(onHashChange: () => void): () => void {
  window.addEventListener('hashchange', onHashChange)
  return () => window.removeEventListener('hashchange', onHashChange)
}

/** 订阅 hash 变化（含前进/后退），返回当前路径。 */
export function useHashPath(): string {
  return useSyncExternalStore(subscribe, getHashPath, getHashPath)
}
