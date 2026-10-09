# 主题颜色维护

## 修改入口

- `app/assets/theme.css`：唯一的应用颜色维护文件。顶部 `:root` 定义亮色语义变量，`:root[data-app-theme='dark']` 覆盖深色值；下方维护组件状态色和装饰配色。
- `app/theme/vant.ts`：只把 Vant 主题字段映射到 `--app-*`，不定义颜色值。字段使用 `ConfigProviderThemeVars` 类型校验。
- `app/assets/main.css`：布局、间距、字号与交互结构。带颜色的边框、阴影等声明位于 theme.css。
- `app/app.vue`：同步 HTML 主题属性并传入 Vant 映射，不再分别维护亮/暗主题对象。

## 常用变量

| 用途 | 变量 |
| --- | --- |
| 主色 / 成功 / 警告 / 错误 | `--app-primary` / `--app-success` / `--app-warning` / `--app-danger` |
| 外层背景 / 页面背景 | `--app-canvas` / `--app-page` |
| 卡片 / 次级表面 | `--app-surface` / `--app-surface-muted` |
| 正文 / 次级文字 / 弱提示 | `--app-text` / `--app-text-secondary` / `--app-text-muted` |
| 边框 / 按压态 | `--app-border` / `--app-active` |
| 导航未选中 / 进度轨道 | `--app-nav-inactive` / `--app-progress-track` |

调应用品牌色只需修改亮/暗模式的 `--app-primary`。页面链接、导航选中、Tab 下划线、发送按钮、用户气泡与焦点边框均引用该变量。装饰卡片、状态背景仍在本文件按业务语义维护，不将所有相近颜色强制合为一个色值。

## 业务配色边界

`mock/data/home.ts` 的首页品牌色、背景，以及 `mock/data/campaign.ts` 的活动 theme 属于业务配置，保留独立。它们通过 `--home-brand`、`--accent`、`--benefit-accent` 或组件动态 color 传入。修改应用主色不会改写 Mock 数据；深色模式仍使用暗色页面背景，以保持可读性。

## 后续规范与验收

新增页面不直接写十六进制或 RGB 颜色，优先引用现有语义变量；确需新的装饰色，在 theme.css 对应组件区域维护。Vant 新字段须通过类型检查。不要在映射中让 `--app-*` 反向引用 `--van-*`，避免循环变量。

人工验收：亮/暗切换和刷新后的主题保持、导航与 Tab、消息气泡、输入焦点、权益配色及不同活动 theme。静态检查和构建不能替代浏览器视觉验收。
