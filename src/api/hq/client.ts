import createClient, { type FetchResponse } from 'openapi-fetch';
import type { MediaType } from 'openapi-typescript-helpers';
import type { paths } from '../generated/lessons-and-receipts';

const HQ_API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const hqClient = createClient<paths>({
  baseUrl: HQ_API_BASE,
  credentials: 'include',
});

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

hqClient.use({
  onRequest({ request }) {
    if (authToken && !request.headers.has('Authorization')) {
      request.headers.set('Authorization', `Bearer ${authToken}`);
    }
    return request;
  },
  onResponse({ response }) {
    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return response;
  },
});

export function setHqAuthToken(token: string | null) {
  authToken = token;
}

export function setHqUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function unwrap<TOperation, TOptions = unknown, TMedia extends MediaType = MediaType>(
  promise: Promise<FetchResponse<TOperation, TOptions, TMedia>>,
): Promise<FetchResponse<TOperation, TOptions, TMedia>["data"]> {
  const result = await promise;
  if ('error' in result && result.error) {
    const message = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
    throw new Error(message);
  }
  return result.data as FetchResponse<TOperation, TOptions, TMedia>["data"];
}

export async function unwrapRequired<TOperation, TOptions = unknown, TMedia extends MediaType = MediaType>(
  promise: Promise<FetchResponse<TOperation, TOptions, TMedia>>,
): Promise<NonNullable<FetchResponse<TOperation, TOptions, TMedia>["data"]>> {
  const data = await unwrap(promise);
  if (data == null) {
    throw new Error('Expected response payload but received empty body');
  }
  return data as NonNullable<FetchResponse<TOperation, TOptions, TMedia>["data"]>;
}

export async function unwrapVoid<TOptions = unknown, TMedia extends MediaType = MediaType>(
  promise: Promise<FetchResponse<unknown, TOptions, TMedia>>,
): Promise<void> {
  const result = await promise;
  if ('error' in result && result.error) {
    const message = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
    throw new Error(message);
  }
  return;
}
