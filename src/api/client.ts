import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) {
    if (!config.headers.has('Authorization')) {
      config.headers.set('Authorization', `Bearer ${authToken}`);
    }
  }
  return config;
});

function extractErrorMessage(error: AxiosError): string {
  const { response, message } = error;
  const data = response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (data && typeof data === 'object') {
    const possible = data as Record<string, unknown>;
    for (const key of ['message', 'error', 'detail']) {
      const value = possible[key];
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

function normalizeBody(body: unknown): unknown {
  if (body === undefined || body === null) {
    return undefined;
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body;
  }
  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (!trimmed) {
      return undefined;
    }
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return body;
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> | undefined {
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && unauthorizedHandler) {
        unauthorizedHandler();
      }
      throw new Error(extractErrorMessage(error));
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}

export function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { method = 'GET', body, headers, signal } = init;
  const normalizedHeaders = normalizeHeaders(headers);
  const data = normalizeBody(body);
  const config: AxiosRequestConfig = {
    url: path,
    method,
    headers: normalizedHeaders,
    data,
    signal: signal ?? undefined,
  };
  return request<T>(config);
}

export const get = <T>(path: string) => request<T>({ url: path, method: 'GET' });
export const post = <T>(path: string, body: unknown) => request<T>({ url: path, method: 'POST', data: normalizeBody(body) });
export const put = <T>(path: string, body: unknown) => request<T>({ url: path, method: 'PUT', data: normalizeBody(body) });
export const patch = <T>(path: string, body: unknown) => request<T>({ url: path, method: 'PATCH', data: normalizeBody(body) });
export const del = <T>(path: string) => request<T>({ url: path, method: 'DELETE' });
