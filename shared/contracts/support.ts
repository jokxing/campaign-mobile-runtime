export const MESSAGE_MAX_LENGTH = 300;
export type SupportParticipant = 'customer' | 'agent';
export interface SendMessageBody { sender: SupportParticipant; content: string }
export interface MarkReadBody { reader: SupportParticipant }

export const supportErrors = {
  INVALID_REQUEST: { status: 422, message: '请求内容有误，请检查后重试。' },
  UNAUTHENTICATED: { status: 401, message: '登录状态已失效，请重新登录后重试。' },
  FORBIDDEN: { status: 403, message: '你没有此会话的访问权限。' },
  NOT_FOUND: { status: 404, message: '会话不存在或已被移除。' },
  CONVERSATION_UNAVAILABLE: { status: 409, message: '当前会话无法执行此操作，请刷新会话状态。' },
  MOCK_UNAVAILABLE: { status: 503, message: '服务暂时不可用，请稍后重试。' }
} as const;
export type SupportErrorCode = keyof typeof supportErrors;

export class ContractError extends Error {
  code: SupportErrorCode;
  field?: string;
  constructor(code: SupportErrorCode, field?: string) {
    super(supportErrors[code].message);
    this.code = code;
    this.field = field;
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ContractError('INVALID_REQUEST');
  return value as Record<string, unknown>;
}

function participant(value: unknown, field: string): SupportParticipant {
  if (value !== 'customer' && value !== 'agent') throw new ContractError('INVALID_REQUEST', field);
  return value;
}

export function parseSendMessage(value: unknown): SendMessageBody {
  const body = object(value);
  const sender = participant(body.sender, 'sender');
  if (typeof body.content !== 'string') throw new ContractError('INVALID_REQUEST', 'content');
  const content = body.content.trim();
  // Match HTML maxlength: UTF-16 code units, after trimming.
  if (!content || content.length > MESSAGE_MAX_LENGTH) throw new ContractError('INVALID_REQUEST', 'content');
  return { sender, content };
}

export function parseMarkRead(value: unknown): MarkReadBody {
  return { reader: participant(object(value).reader, 'reader') };
}

export function supportErrorMessage(error: unknown): string {
  if (error instanceof ContractError) return error.message;
  if (error && typeof error === 'object' && 'data' in error) {
    const payload = (error as { data?: { data?: { code?: string } } }).data;
    const code = payload?.data?.code;
    if (code && Object.hasOwn(supportErrors, code)) return supportErrors[code as SupportErrorCode].message;
  }
  return '请求未完成，请检查网络后重试。';
}
