/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
import { HttpClient } from './client.js';
import { PatientModule } from './modules/patient.js';
import { AppointmentModule } from './modules/appointment.js';
import { CdsModule } from './modules/cds.js';
import type { ClientOptions } from './types.js';

export * from './types.js';

/**
 * iHealthOne OS 开放平台客户端
 *
 * ```ts
 * const client = new IHealthOneClient({ baseUrl, appId, appSecret });
 * const patient = await client.patient.get360('MZ00000143');
 * ```
 */
export class IHealthOneClient {
  readonly patient: PatientModule;
  readonly appointment: AppointmentModule;
  readonly cds: CdsModule;

  constructor(options: ClientOptions) {
    const http = new HttpClient(options);
    this.patient = new PatientModule(http);
    this.appointment = new AppointmentModule(http);
    this.cds = new CdsModule(http);
  }
}

export default IHealthOneClient;
