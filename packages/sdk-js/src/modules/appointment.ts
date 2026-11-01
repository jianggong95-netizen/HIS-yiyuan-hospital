/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
import type { HttpClient } from '../client.js';
import type { Appointment, AppointmentInput, QueueBoard } from '../types.js';

/** 预约、排队叫号 */
export class AppointmentModule {
  constructor(private readonly http: HttpClient) {}

  create(input: AppointmentInput): Promise<Appointment> {
    return this.http.post<Appointment>('/api/v1/appointments', input);
  }

  /** 排队叫号看板，供大屏 / 微信端轮询 */
  getQueueBoard(deptCode: string): Promise<QueueBoard> {
    return this.http.get<QueueBoard>(`/api/v1/queue/${encodeURIComponent(deptCode)}`);
  }
}
