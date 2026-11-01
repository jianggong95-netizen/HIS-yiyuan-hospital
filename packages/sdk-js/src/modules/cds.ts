/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
import type { HttpClient } from '../client.js';
import type { PrescriptionCheckResult, PrescriptionItem } from '../types.js';

/** 临床辅助决策：合理用药、过敏、剂量、医保限定 */
export class CdsModule {
  constructor(private readonly http: HttpClient) {}

  checkPrescription(input: {
    patientId: string;
    items: PrescriptionItem[];
  }): Promise<PrescriptionCheckResult> {
    return this.http.post<PrescriptionCheckResult>('/api/v1/cds/prescription-check', input);
  }
}
