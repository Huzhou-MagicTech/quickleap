---
name: daisyui
description: >
  前端专家：使用 TailwindCSS + daisyUI，保持 UI 简洁现代，自适应布局，避免内联样式，
  优先 flex/grid。
metadata:
  target: react-component
  style: clean
  responsive: true
compatibility:
  - opencode
  - ">=typescript4"
user-invocable: true
---

# Skill: daisyui

本项目使用 Tailwind CSS v4 + daisyUI v5 进行前端开发。

## daisyUI 组件

### Button (按钮)

```tsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-outline">Outline</button>
<button className="btn btn-sm">Small</button>
<button className="btn btn-lg">Large</button>
<button className="btn btn-disabled">Disabled</button>
<button className="btn btn-circle btn-ghost">
  <span className="sr-only">Icon</span>
</button>
```

### Card (卡片)

```tsx
<div className="card w-96 bg-base-100 shadow-sm">
  <div className="card-body">
    <h2 className="card-title">Title</h2>
    <p>Content</p>
    <div className="justify-end card-actions">
      <button className="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

### Input (输入框)

```tsx
<input type="text" className="input input-bordered" placeholder="Type here" />
<input type="text" className="input input-primary" />
<input type="text" className="input input-error" />
```

### Form Control

```tsx
<div className="form-control">
  <label className="label">
    <span className="label-text">Label</span>
  </label>
  <input type="text" className="input input-bordered" />
  <label className="label">
    <span className="label-text-alt">Helper text</span>
  </label>
</div>
```

### Badge (徽章)

```tsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-secondary">Secondary</span>
<span className="badge badge-outline">Outline</span>
<span className="badge badge-lg">Large</span>
```

### 其他组件

```tsx
// Avatar
<div className="avatar">
  <div className="w-12 rounded-full">
    <img src="/image.jpg" alt="Avatar" />
  </div>
</div>

// Alert
<div className="alert">
  <span>Alert message</span>
</div>

// Modal
<dialog className="modal modal-open">
  <div className="modal-box">
    <h3 className="font-bold">Hello!</h3>
    <p className="py-4">Press ESC to close</p>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

// Loading
<span className="loading loading-spinner" />
<span className="loading loading-dots" />
<span className="loading loading-ring" />
```

## 响应式设计

使用 `sm:`、`md:`、`lg:`、`xl:` 前缀实现响应式布局。

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 内容 */}
</div>

<button className="btn btn-sm sm:btn-md lg:btn-lg">Responsive Button</button>
```

## 自定义 CSS 变量

项目定义了以下自定义变量：

```css
var(--sea-ink)        /* 主文字颜色 */
var(--sea-ink-soft)   /* 次要文字颜色 */
var(--header-bg)      /* 头部背景 */
var(--chip-bg)        /* Chip 背景 */
var(--chip-line)      /* Chip 边框 */
var(--link-bg-hover)  /* 链接 hover 背景 */
var(--line)           /* 分割线颜色 */
```

使用方式：

```tsx
<header className="bg-[var(--header-bg)] text-[var(--sea-ink)]">
  <nav className="text-[var(--sea-ink-soft)]">
    <a className="hover:bg-[var(--link-bg-hover)]">Link</a>
  </nav>
</header>
```

## 布局模式

优先使用 flex 和 grid：

```tsx
// Flex 居中
<div className="flex items-center justify-center h-screen">...</div>

// Grid 双列 (移动端单列)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">...</div>

// Flex 尾部对齐
<div className="flex flex-col h-full">
  <div>Content</div>
  <div className="mt-auto">Footer</div>
</div>
```

## 注意事项

1. **避免内联样式**：所有样式使用 className 和 Tailwind CSS 类
2. **优先 daisyUI 组件**：优先使用 daisyUI 提供的组件类
3. **响应式优先**：移动端优先，逐步增强
4. **语义化标签**：使用语义化 HTML 标签
5. **无障碍**：添加 `sr-only` 标签为屏幕阅读器提供内容
