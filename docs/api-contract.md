# 前端与 Mock 接口契约 v1

状态：当前项目的可执行约定，尚未与真实后端团队评审。目标是让前端独立开发，同时让后续接手者能按约定替换数据提供方。

## 数据与职责

本项目没有独立业务后端。Nuxt 的 `server/api` 只提供本地 Mock HTTP/SSE，客服状态在内存中，重启恢复；不提供真实账号认证、数据持久化或用户隔离。

| 内容 | 文件 | 修改入口 |
| --- | --- | --- |
| 活动数据 | `mock/data/campaign.ts` | `defaultCampaignConfig` |
| 首页数据 | `mock/data/home.ts` | `defaultHomeConfig` |
| 会话、消息种子 | `mock/data/support.ts` | `createSupportConversations(now?)` |
| 会话运行状态与操作 | `server/utils/support-store.ts` | 从种子工厂初始化，管理内存状态 |
| 异常场景 | `server/middleware/support-mock.ts` | 请求头 `X-Mock-Scenario` |
| 前端请求封装 | `app/api/campaign.ts`、`app/api/support.ts` | 具名 API 函数 |
| 消息参数、限制与错误码 | `shared/contracts/support.ts` | 前端与 Mock 共用校验器 |
| 配置模型与运行时校验 | `shared/campaign.ts`、`shared/home.ts`、`shared/contracts/preview.ts` | 配置协议 v1 |

前端负责交互、加载/失败状态、输入保留、可访问反馈；Mock 负责按契约返回成功和失败数据；未来后端负责身份、权限及持久化。Mock 的 `sender`/`reader` 用来模拟两个参与方，不代表可信身份。

## HTTP 约定

同源请求，JSON 请求体；成功为 200。时间字段 `createdAt/updatedAt/generatedAt` 使用 ISO 时间串；活动日期为有效 `YYYY-MM-DD`。会话路径 ID 由 API 层编码。未知附加请求字段忽略，已定义字段必须符合类型。

| 方法 | 路径 | 参数 | 成功响应 |
| --- | --- | --- | --- |
| GET | `/api/campaign-runtime` | query.context，可省略，默认 member | `{ config, context, generatedAt }` |
| GET | `/api/support/conversations` | 无 | `{ records: ConversationSummary[] }`，无 messages，包含 messageCount |
| GET | `/api/support/conversations/:id` | 会话 ID | `{ conversation: SupportConversation }`，含 messages |
| POST | `/api/support/conversations/:id/messages` | `{ sender: 'customer' \| 'agent', content: string }` | `{ message: SupportMessage }` |
| POST | `/api/support/conversations/:id/read` | `{ reader: 'customer' \| 'agent' }` | `{ conversation }` |
| POST | `/api/support/conversations/:id/claim` | 无 | `{ conversation }`，进入 active |
| POST | `/api/support/conversations/:id/close` | 无 | `{ conversation }`，进入 closed |
| GET | `/api/support/events` | 无 | SSE，见事件协议 |

发送内容先 trim，再检查 1～300 个 UTF-16 单元，与 textarea maxlength 一致；例如一个常见 emoji 占 2 单元。null、数组、缺失字段、非法角色、数字内容、空白及超长消息返回 422，不进行隐式字符串转换。非法 JSON 同样返回 422。

客服可在 active 会话回复；customer 可在 waiting/active 发送；closed 禁止发送。详情/read/close 找不到会话返回 404，messages/claim 不存在或状态不允许返回 409（保留当前语义，后续变更需同步客户端）。已读重复操作不新增消息。

发送示例：

```json
{ "sender": "customer", "content": "请确认周末活动是否需要预约。" }
```

错误响应沿用 Nitro 外层格式，客户端仅依赖 HTTP 状态和 `data.code`，不依赖框架附加的 url/stack 等字段：

```json
{
  "statusCode": 422,
  "statusMessage": "INVALID_REQUEST",
  "data": { "code": "INVALID_REQUEST", "message": "请求内容有误，请检查后重试。", "field": "content" }
}
```

| HTTP | data.code | 前端反馈 |
| --- | --- | --- |
| 422 | INVALID_REQUEST | 检查输入，保留草稿 |
| 401 | UNAUTHENTICATED | 显示登录失效文字；本演示未实现登录页 |
| 403 | FORBIDDEN | 显示无访问权限 |
| 404 | NOT_FOUND | 显示会话不存在，提供重新加载 |
| 409 | CONVERSATION_UNAVAILABLE | 提示刷新会话状态，保留草稿 |
| 503 | MOCK_UNAVAILABLE | 显示服务暂不可用，允许重试 |
| 网络失败/未知错误 | 不要求 code | 显示网络重试提示，保留草稿 |

## 可重复 Mock 场景

请求头 `X-Mock-Scenario` 支持 success（默认）、unauthenticated、forbidden、conflict、unavailable；empty 仅用于 GET 会话列表。未知场景返回 422。场景仅影响当前请求，在写入前返回，不修改共享种子数据。客服响应有 `X-Data-Source: mock` 标识。

本地启动 `npm run dev` 后，在 PowerShell 执行：

```powershell
curl.exe -i -H "X-Mock-Scenario: forbidden" http://localhost:4180/api/support/conversations
curl.exe -i -H "X-Mock-Scenario: empty" http://localhost:4180/api/support/conversations
```

这些是模拟响应开关，不是权限实现。原生 EventSource 不支持附加此自定义请求头；浏览器 SSE 断线场景使用 DevTools Offline 模拟。HTTP 场景已纳入自动测试，浏览器视觉和交互另行验收。

## SSE 协议

`data` 是 JSON：`{ type: 'message.created' | 'conversation.updated', conversationId, occurredAt }`。事件只通知刷新；完整数据仍由 HTTP 获取。每 15 秒发送 `{ type: 'heartbeat' }`，前端忽略。无历史回放和 exactly-once 保证；当前 Mock 对所有连接广播，不模拟真实用户隔离。

## 配置预览协议

默认关闭。需要与编排端联调时，在当前 PowerShell 会话设置后启动：

```powershell
$env:NUXT_PUBLIC_PREVIEW_ENABLED = 'true'
$env:NUXT_PUBLIC_PREVIEW_ALLOWED_ORIGINS = 'http://localhost:4173,http://localhost:9527'
npm run dev
```

iframe 地址仍传 `?parentOrigin=http%3A%2F%2Flocalhost%3A4173`。query 只选择目标，不能增加信任。来源必须为当前 origin 或环境白名单的精确 origin；消息 source 必须为父窗口。`127.0.0.1` 与 `localhost` 是不同来源，要分别配置。生产预览如需启用，也要显式配置。

- 活动：`{ channel: 'campaign-studio', type: 'CONFIG_UPDATE', payload: CampaignConfig }`
- 首页：`{ channel: 'mobile-home-composer', type: 'SCHEMA_UPDATE', payload: HomeConfig }`
- 子页面就绪：原 channel + `type: 'PREVIEW_READY'`。

v1 限制：活动最多 100 项、分类 30 项、规则步骤 30 项、target 为 1～100 整数；首页模块最多 50 项、每模块 items 最多 50 项。颜色为六位十六进制；日期必须有效且起止有序；ID 唯一，活动 code 唯一，枚举合法。短文本最多 200、说明最多 1000、ID/code 最多 100、unit 最多 50 个 UTF-16 单元。首页可选文本缺失合法，提供时不能为空白。非法更新整包拒绝，保留旧配置；支持已知字段以外的扩展字段，不使用它们渲染。

## 替换真实数据提供方时的待确认项

1. 身份由真实会话推导，移除或忽略可伪造的 sender/reader；确认 401 的登录跳转方式。
2. 确认列表分页、会话归属、SSE 用户隔离、鉴权续期及事件补偿策略。
3. 确认发送幂等键及超时后重复提交规则；当前 Mock 未实现幂等。
4. 保持成功结构及错误码语义；需要破坏性变更时升级契约并同步 Mock、API、UI、测试和文档。

以上是交接问题，不是本项目已完成的后端能力。
