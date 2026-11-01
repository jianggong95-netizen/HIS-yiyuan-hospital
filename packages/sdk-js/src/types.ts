/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
/** HIS-yiyuan-hospital 开放平台 —— 通用类型定义（演示版） */

export interface ClientOptions {
  /** 网关地址，例如 https://open.example-hospital.cn */
  baseUrl: string;
  /** 应用 ID，由医院信息科或开放平台分配 */
  appId: string;
  /** 应用密钥，请勿写入前端代码 */
  appSecret: string;
  /** 请求超时，默认 15000ms */
  timeout?: number;
  /** 失败重试次数，默认 2（仅对幂等请求生效） */
  retries?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
}

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
}

export interface Allergy {
  allergen: string;
  reaction: string;
  level: '轻度' | '中度' | '重度';
}

export interface Encounter {
  encounterId: string;
  visitType: string;
  visitTime: string;
  dept: string;
  doctor: string;
  chiefComplaint?: string;
  diagnosis: string[];
  orders?: Array<Record<string, unknown>>;
}

export interface LabResult {
  item: string;
  value: string;
  unit: string;
  ref: string;
  flag: 'H' | 'L' | 'N';
  time: string;
}

export interface Patient360 {
  patientId: string;
  mrn: string;
  name: string;
  gender: '男' | '女' | '未知';
  age: number;
  birthDate: string;
  phone?: string;
  insuranceType?: string;
  vipLevel?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies: Allergy[];
  chronicConditions: string[];
  tags: string[];
  lastVisit?: {
    encounterId: string;
    visitTime: string;
    dept: string;
    doctor: string;
    diagnosis: string[];
  };
  encounters: Encounter[];
  labResults: LabResult[];
}

export interface PrescriptionItem {
  drugCode: string;
  dose: number;
  unit: string;
  freq: string;
  days?: number;
}

export interface CdsAlert {
  level: 'ERROR' | 'WARN' | 'INFO';
  code: string;
  message: string;
}

export interface PrescriptionCheckResult {
  patientId: string;
  passed: boolean;
  alerts: CdsAlert[];
  checkedAt: string;
}

export interface AppointmentInput {
  patientId: string;
  deptCode: string;
  doctorCode?: string;
  visitTime: string;
}

export interface Appointment {
  appointmentId: string;
  patientId: string;
  deptCode: string;
  doctorCode: string | null;
  visitTime: string;
  queueNo: string;
  room: string;
  status: 'BOOKED' | 'CHECKED_IN' | 'CANCELLED';
}

export interface QueueBoard {
  deptCode: string;
  deptName: string;
  calling: { queueNo: string; room: string; doctor: string };
  waiting: number;
  avgWaitMinutes: number;
  items: Array<{ queueNo: string; patientId: string; status: string }>;
}
