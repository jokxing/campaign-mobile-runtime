# 后台与移动端协作

本项目与 [MultiTenant Admin Lab](https://github.com/jokxing/multiTenant-admin-lab) 分别维护工程与文档。后台提供首页模块、活动配置和编排预览；本项目按配置渲染移动端页面，并提供 HTTP/SSE Mock 与异常交互示例。

## 个人职责

原业务中本人主导 SaaS 后台前端，另一名前端主要负责移动端。本人支援首页、客服的页面和功能开发，并与移动端同事约定首页组件字段。大部分移动端 UI 组件由该同事实现，主要接口联调由他与后端共同完成；不将移动端整体架构、全部组件或完整联调链路归为本人独立成果。

原首页按租户需求设计组件，由租户设置组件开关，启用组件组成页面，支持排序、显隐、素材和跳转配置。后台发版后，移动端刷新请求接口取得配置。原客服使用 WebSocket；当前作品采用 HTTP/SSE Mock 与 iframe 预览，两种机制分别说明。

原移动端支援阶段以手写代码和 VS Code Tab 补全为主，当前作品使用 AI 辅助提炼和整理。完整案例与面试讨论见[项目导览](project-guide.md)。

## 联调协议

除配置预览外，后台客服服务台还直接请求本项目 origin 的 /api/support，通过 HTTP 操作共享内存会话，SSE 通知刷新。后台读取 VITE_MOBILE_RUNTIME_URL 的 origin，预览路径 /home 不作为 API 前缀。与后台“实时待办”本地事件页无关，也不构成生产用户隔离。详见[客服关联](project-guide.md#后台服务台与本服务的关联)。

| 场景 | channel | 更新类型 |
| --- | --- | --- |
| 首页配置 | `mobile-home-composer` | `SCHEMA_UPDATE` |
| 活动配置 | `campaign-studio` | `CONFIG_UPDATE` |

iframe 子页面发送同一 channel 的 `PREVIEW_READY`；后台再通过 `postMessage` 传递配置。移动端检查父窗口、精确来源白名单及配置结构，非法更新整包拒绝并保留旧配置。完整限制见[接口与预览契约](api-contract.md#配置预览协议)。

## 启动预览

先安装依赖，再在启动开发服务的 PowerShell 会话中设置：

```powershell
$env:NUXT_PUBLIC_PREVIEW_ENABLED = 'true'
$env:NUXT_PUBLIC_PREVIEW_ALLOWED_ORIGINS = 'http://localhost:9527'
npm run dev
```

白名单需替换为后台实际 origin。`localhost`、`127.0.0.1` 和不同端口是不同 origin。后台可用 `VITE_MOBILE_RUNTIME_URL` 指定移动入口，默认 `http://localhost:4180/home`。预览默认关闭，URL 参数不能扩大信任来源。

## 阅读入口与边界

- [接口契约](api-contract.md)：HTTP/SSE、配置协议及 Mock 场景。
- [运行时来源与配置校验](../shared/contracts/preview.ts)：预览接收约束。
- [首页模型](../shared/home.ts)、[活动模型](../shared/campaign.ts)：版本化配置。
- [协作与演示路线](collaboration-and-demo.md)：异常体验、接口协作与验收说明。

后台的配置发布保存到其浏览器存储，跨端预览不代表线上部署、服务端持久化或共用账号系统。本项目的 SSE 来自 Nuxt 本地客服 Mock，与后台实时待办页的事件模拟分别实现。真实服务仍需身份、权限、持久化及事件补偿设计。

本文依据两端源码和现有契约整理，未在本次文档整理中重新执行双端联调验收。
