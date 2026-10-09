# Campaign Mobile Runtime

项目开发规范与全局检查结果见 [优化规范清单](docs/optimization-checklist.md)。前端接口统一维护在 `app/api/`，提交前执行 `npm run check:api`、`npm run typecheck` 和 `npm run build`。

Nuxt 移动端前端作品，同时承载首页、活动中心、会员中心和消息会话。所有数据均为 Mock；`server/api` 是本地 HTTP/SSE 模拟层，没有独立业务后端。通过两套版本化配置协议与编排端联动。

- [前端与 Mock 接口契约 / 数据文件位置](docs/api-contract.md)
- [Mock 数据目录与维护说明](mock/README.md)
- [主题颜色维护说明](docs/theme.md)
- [异步协作方式、决策记录与演示路线](docs/collaboration-and-demo.md)
- [项目导览与面试讨论](docs/project-guide.md)：个人贡献、首页配置案例、体验路线、代码入口及面试问答。
- 配置预览默认关闭，开启方式见契约文档及 `.env.example`。

## 与后台编排端的关联

关联工程为 [MultiTenant Admin Lab](https://github.com/jokxing/multiTenant-admin-lab)，两端独立运行、分别维护文档。后台负责首页与活动编排，本项目负责配置运行时和移动端交互，通过版本化预览协议关联。

原项目中本人主导 SaaS 后台，另一名前端主要负责移动端。本人支援首页、客服的页面与功能开发，并与移动端同事约定首页组件字段；大部分 UI 组件由移动端同事实现，主要接口联调由他和后端共同完成。租户设置组件开关，启用组件组成页面，还可配置排序、显隐、素材和跳转；后台发版后移动端刷新请求接口取得配置。

原移动端支援阶段以手写代码和 VS Code Tab 补全为主，当前作品使用 AI 辅助提炼和整理。原客服使用 WebSocket，当前展示使用 HTTP/SSE Mock；当前预览协议不作为原项目历史发布机制介绍。个人支援范围与当前作品实现分别说明，详见正式导览。

两端职责、预览消息和联调设置见[后台与移动端协作](docs/admin-integration.md)。

```bash
npm install
npm run dev
```

- 首页：`http://localhost:4180/home`
- 活动中心：`http://localhost:4180/campaigns`
- 会员中心：`http://localhost:4180/member`
- 活动详情：`http://localhost:4180/campaign/:code?id=:id`
