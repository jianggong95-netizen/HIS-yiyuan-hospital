/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
import type { ClientOptions } from './types.js';

/**
 * 轻量 HTTP 客户端：签名、超时、重试、统一错误封装。
 * 演示实现，生产环境由网关侧的 AK/SK 签名体系接管。
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly timeout: number;
  private readonly retries: number;

  constructor(options: ClientOptions) {
    if (!options.baseUrl) throw new Error('baseUrl is required');
    if (!options.appId) throw new Error('appId is required');

    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeout = options.timeout ?? 15_000;
    this.retries = options.retries ?? 2;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-IH1-AppId': options.appId,
      // 真实环境：Authorization = IH1-Sign <appId>:<nonce>:<timestamp>:<signature>
      Authorization: `IH1-Demo ${options.appId}:${options.appSecret}`,
      ...options.headers,
    };
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  private async request<T>(method: string, path: string, body?: unknown, attempt = 0): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await res.text();
      const payload = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const err = new Error(payload?.message || `HTTP ${res.status}`) as Error & {
          code?: string;
          status?: number;
        };
        err.code = payload?.code ?? 'HTTP_ERROR';
        err.status = res.status;
        // 5xx 与网络抖动才重试，4xx 直接抛出
        if (res.status >= 500 && attempt < this.retries) {
          return this.request<T>(method, path, body, attempt + 1);
        }
        throw err;
      }

      return payload as T;
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if ((isAbort || err instanceof TypeError) && attempt < this.retries) {
        const backoff = 200 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
        return this.request<T>(method, path, body, attempt + 1);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
