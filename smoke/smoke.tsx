import { JSDOM } from 'jsdom'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import App from '../src/App'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let systemDark = false
const mediaListeners = new Set<() => void>()

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/vite-deploy/',
})
const { window } = dom
window.matchMedia = ((query: string) => ({
  matches: systemDark,
  media: query,
  onchange: null,
  addEventListener: (_: string, l: () => void) => mediaListeners.add(l),
  removeEventListener: (_: string, l: () => void) => mediaListeners.delete(l),
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
})) as any
;(globalThis as any).window = window
;(globalThis as any).document = window.document
;(globalThis as any).localStorage = window.localStorage
;(globalThis as any).HTMLElement = window.HTMLElement
;(globalThis as any).Node = window.Node
;(globalThis as any).MouseEvent = window.MouseEvent

const fireSystemChange = () => mediaListeners.forEach((l) => l())
const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms))

const root = createRoot(window.document.getElementById('root')!)
await act(async () => {
  root.render(React.createElement(App))
  await tick()
})

const text = () => window.document.body.textContent ?? ''
const activeTitle = () =>
  window.document.querySelector('.nav-link.is-active')?.textContent?.trim()
const dataTheme = () => window.document.documentElement.getAttribute('data-theme')

// 1) 初始：首页、标题、高亮、无存储键、跟随系统（浅色）
assert.equal(activeTitle(), '首页')
assert.equal(window.document.title, '首页 · Vite 多视图演示')
assert.equal(dataTheme(), 'light')
assert.equal(window.localStorage.getItem('vite-deploy:theme'), null)
assert.match(text(), /来源：跟随系统/)
assert.match(text(), /〈无键〉/)
console.log('✓ 初始渲染：首页高亮 / 标题 / 无键跟随系统')

// 2) 切到 #/about：高亮与标题随路由同步
await act(async () => {
  window.location.hash = '#/about'
  await tick()
})
assert.equal(activeTitle(), '关于')
assert.equal(window.document.title, '关于 · Vite 多视图演示')
assert.match(text(), /深链（如/)
console.log('✓ hash 切路由：导航高亮与标题同步')

// 3) 未知路径落兜底页
await act(async () => {
  window.location.hash = '#/totally-unknown'
  await tick()
})
assert.equal(window.document.querySelector('.nav-link.is-active'), null)
assert.match(text(), /404/)
assert.match(text(), /页面不存在（兜底）/)
assert.equal(window.document.title, '页面不存在 · Vite 多视图演示')
console.log('✓ 未知路径：无高亮 + 兜底页 + 兜底标题')

// 4) 显式选深色：落盘、来源转用户、data-theme 切换
await act(async () => {
  window.location.hash = '#/'
  await tick()
})
const darkBtn = [
  ...window.document.querySelectorAll<HTMLButtonElement>('.theme-btn'),
].find((b) => b.textContent === '深')!
await act(async () => {
  darkBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  await tick()
})
assert.equal(window.localStorage.getItem('vite-deploy:theme'), 'dark')
assert.equal(dataTheme(), 'dark')
assert.match(text(), /来源：用户显式选择/)
assert.match(text(), /"dark"/)
console.log('✓ 显式深色：落盘 / 来源=用户 / data-theme=dark')

// 5) 系统切回浅色，不得覆盖用户已选值
systemDark = false
await act(async () => {
  fireSystemChange()
  await tick()
})
assert.equal(dataTheme(), 'dark')
console.log('✓ 系统配色变更不覆盖用户已选值')

// 6) 模拟刷新：在全新 DOM 中执行 dist/index.html 内的 pre-paint 脚本（深色已落盘）
const html = readFileSync('dist/index.html', 'utf8')
const prePaint = html.match(/<script>\s*\/\/ 首屏渲染前[\s\S]*?<\/script>/)![0]
  .replace(/^<script>/, '')
  .replace(/<\/script>$/, '')
const fresh = new JSDOM(html, {
  url: 'http://localhost/vite-deploy/',
  beforeParse(w: any) {
    let dark = true
    w.matchMedia = () => ({ matches: dark, media: '', addEventListener() {}, removeEventListener() {} })
  },
})
fresh.window.localStorage.setItem('vite-deploy:theme', 'dark')
fresh.window.Function(prePaint).call(fresh.window)
assert.equal(fresh.window.document.documentElement.getAttribute('data-theme'), 'dark')
console.log('✓ pre-paint 脚本：已落盘深色在首屏前回填（不闪白）')

// 7) pre-paint 无键 + 系统深色 => 跟随系统
const fresh2 = new JSDOM('<!doctype html><html></html>', {
  url: 'http://localhost/vite-deploy/',
  beforeParse(w: any) {
    w.matchMedia = () => ({ matches: true, media: '', addEventListener() {}, removeEventListener() {} })
  },
})
fresh2.window.Function(prePaint).call(fresh2.window)
assert.equal(fresh2.window.document.documentElement.getAttribute('data-theme'), 'dark')
console.log('✓ pre-paint 脚本：无键时跟随系统深色')

// 8) 回到“未选择”：删键、来源转系统，系统变化立即生效
const sysBtn = [
  ...window.document.querySelectorAll<HTMLButtonElement>('.theme-btn'),
].find((b) => b.textContent === '未选择')!
await act(async () => {
  sysBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  await tick()
})
assert.equal(window.localStorage.getItem('vite-deploy:theme'), null)
assert.equal(dataTheme(), 'light')
assert.match(text(), /来源：跟随系统/)
systemDark = true
await act(async () => {
  fireSystemChange()
  await tick()
})
assert.equal(dataTheme(), 'dark')
console.log('✓ 未选择：删键跟随系统，系统切换实时生效')

// 9) 显式浅色后再模拟一次刷新回填
const lightBtn = [
  ...window.document.querySelectorAll<HTMLButtonElement>('.theme-btn'),
].find((b) => b.textContent === '浅')!
await act(async () => {
  lightBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  await tick()
})
assert.equal(window.localStorage.getItem('vite-deploy:theme'), 'light')
const fresh3 = new JSDOM('<!doctype html><html></html>', {
  url: 'http://localhost/vite-deploy/',
  beforeParse(w: any) {
    w.matchMedia = () => ({ matches: true, media: '', addEventListener() {}, removeEventListener() {} })
  },
})
fresh3.window.localStorage.setItem('vite-deploy:theme', 'light')
fresh3.window.Function(prePaint).call(fresh3.window)
assert.equal(fresh3.window.document.documentElement.getAttribute('data-theme'), 'light')
console.log('✓ 系统深色 + 已选浅色：首屏回填浅色，来源仍为用户')

root.unmount()
console.log('\n全部冒烟断言通过 ✅')
process.exit(0)


