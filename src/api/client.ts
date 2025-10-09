import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

client.interceptors.request.use((config: any) => {
  const headers: Record<string, string> = { ...(config.headers || {}) };
  if (authToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const method = config.method ? String(config.method).toUpperCase() : 'GET';
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (method !== 'GET' && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  config.headers = headers;
  return config;
});

function extractErrorMessage(error: AxiosError): string {
  const { response, message } = error;
  const data = response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (data && typeof data === 'object') {
    const source = data as Record<string, unknown>;
    for (const key of ['message', 'error', 'detail']) {
      const value = source[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
  }
  if (response?.status) {
    return `HTTP ${response.status}`;
  }
  return message || 'Request failed';
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function prepareBody(body: unknown) {
  if (body === undefined || body === null) {
    return body ?? undefined;
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body;
  }
  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (!trimmed) {
      return body;
    }
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    const looksJson =
      (first === '{' && last === '}') ||
      (first === '[' && last === ']') ||
      (first === '"' && last === '"');
    return looksJson ? body : JSON.stringify(body);
  }
  return JSON.stringify(body);
}

function normalizeHeaders(headers?: HeadersInit) {
  if (!headers) {
    return undefined;
  }
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await client.request<T>(config);
    if (response.status === 204) {
      return undefined as T;
    }
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && unauthorizedHandler) {
        unauthorizedHandler();
      }
      throw new Error(extractErrorMessage(error));
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(typeof error === 'string' ? error : String(error));
  }
}

export function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { method = 'GET', body, headers, signal } = init;
  const config: AxiosRequestConfig = {
    url: path,
    method,
  };
  const normalizedHeaders = normalizeHeaders(headers);
  if (normalizedHeaders) {
    config.headers = normalizedHeaders;
  }
  if (signal) {
    config.signal = signal;
  }
  if (body !== undefined) {
    config.data = prepareBody(body);
  }
  return request<T>(config);
}

export const get = <T>(path: string) => request<T>({ url: path, method: 'GET' });
export const post = <T>(path: string, body: unknown) =>
  request<T>({ url: path, method: 'POST', data: prepareBody(body) });
export const put = <T>(path: string, body: unknown) =>
  request<T>({ url: path, method: 'PUT', data: prepareBody(body) });
export const patch = <T>(path: string, body: unknown) =>
  request<T>({ url: path, method: 'PATCH', data: prepareBody(body) });
export const del = <T>(path: string) =>
  request<T>({ url: path, method: 'DELETE' });
