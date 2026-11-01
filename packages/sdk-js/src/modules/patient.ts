/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
import type { HttpClient } from '../client.js';
import type { Encounter, Patient360 } from '../types.js';

/** 患者主索引（EMPI）与患者 360 视图 */
export class PatientModule {
  constructor(private readonly http: HttpClient) {}

  /** 患者 360：基本信息 + 就诊 + 过敏 + 检验 + 用药，一次取回 */
  get360(patientId: string): Promise<Patient360> {
    return this.http.get<Patient360>(`/api/v1/patients/${encodeURIComponent(patientId)}`);
  }

  /** 就诊记录列表（门诊 / 住院 / 体检） */
  async listEncounters(patientId: string): Promise<Encounter[]> {
    const res = await this.http.get<{ items: Encounter[] }>(
      `/api/v1/patients/${encodeURIComponent(patientId)}/encounters`,
    );
    return res.items;
  }

  /** 简易检索：按姓名 / 就诊卡号 / 手机号后四位 */
  async search(keyword: string): Promise<Array<{ patientId: string; name: string }>> {
    const res = await this.http.get<{ items: Array<{ patientId: string; name: string }> }>(
      `/api/v1/patients?keyword=${encodeURIComponent(keyword)}`,
    );
    return res.items;
  }
}
