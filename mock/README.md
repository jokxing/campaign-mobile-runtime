# Mock 数据维护

模拟初始数据统一在 `mock/data/`，按业务拆分。修改展示内容从这里开始，不在页面、composable 或接口处理器重复定义种子数据。

| 文件 | 导出 | 用途 |
| --- | --- | --- |
| `data/home.ts` | `defaultHomeConfig` | 首页模块配置 |
| `data/campaign.ts` | `defaultCampaignConfig` | 活动分类、详情和规则 |
| `data/support.ts` | `createSupportConversations(now?)` | 客服会话与消息初始数据 |

首页和活动模板由调用方 `structuredClone` 后使用，避免直接修改共享模板。客服工厂每次创建独立数组及嵌套消息，默认使用当前时间；测试可传入固定毫秒时间戳。

`server/utils/support-store.ts` 从工厂初始化内存状态，负责发送、已读、接单、关闭和事件发布；运行期间的修改不会写回数据文件，重启后恢复种子数据。

目录职责：

- `mock/data/` 只存数据及创建初始数据的函数，不调用 HTTP、Vue、Nuxt 或修改应用状态。
- `shared/` 存公共类型、校验规则和错误码。
- `server/api/` 提供 Mock HTTP/SSE 响应，异常场景仍在 `server/middleware/support-mock.ts`。
- `app/api/` 封装前端请求，composables 管理运行状态。

新增业务在 data 下增加对应文件，显式导入所需文件，不通过统一入口把客服数据一起引入浏览器。修改字段需同步 [接口契约](../docs/api-contract.md) 和测试。

验证：`npm test`、`npm run check:api`、`npm run typecheck`、`npm run build`，构建后运行 `npm run test:mock`。
