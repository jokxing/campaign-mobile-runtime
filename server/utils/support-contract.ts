import { ContractError, supportErrors, type SupportErrorCode } from '../../shared/contracts/support';
import type { H3Event } from 'h3';

export async function readSupportBody<T>(event: H3Event, parser: (value: unknown) => T): Promise<T> {
  let body: unknown;
  try {
    body = await readBody<unknown>(event);
  } catch {
    return supportFailure('INVALID_REQUEST');
  }
  return validateSupportBody(parser, body);
}

export function supportFailure(code: SupportErrorCode, field?: string): never {
  throw createError({
    statusCode: supportErrors[code].status,
    statusMessage: code,
    data: { code, message: supportErrors[code].message, ...(field ? { field } : {}) }
  });
}

export function validateSupportBody<T>(parser: (value: unknown) => T, value: unknown): T {
  try {
    return parser(value);
  } catch (error) {
    if (error instanceof ContractError) return supportFailure(error.code, error.field);
    throw error;
  }
}
