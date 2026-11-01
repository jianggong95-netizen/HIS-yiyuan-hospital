#!/usr/bin/env node
/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
/**
 * his —— HIS-yiyuan-hospital 命令行工具（演示版，零依赖）
 *
 * 用法：
 *   his doctor                       检查配置与网关连通性
 *   his patient 360 <patientId>      打印患者 360 摘要
 *   his queue <deptCode>             打印排队叫号看板
 *   his --version
 */
'use strict';

const VERSION = '2.6.0-preview.3';
const BASE = process.env.HIS_BASE_URL || 'http://localhost:8787';
const APP_ID = process.env.HIS_APP_ID || 'demo-app';

const C = {
  reset: '\u001b[0m',
  dim: '\u001b[2m',
  blue: '\u001b[36m',
  green: '\u001b[32m',
  red: '\u001b[31m',
  yellow: '\u001b[33m',
  bold: '\u001b[1m',
};

const line = (label, value) => console.log(`  ${C.dim}${label.padEnd(14)}${C.reset}${value}`);

async function getJson(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'X-HIS-AppId': APP_ID } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ${path}`);
  return res.json();
}

async function cmdDoctor() {
  console.log(`${C.bold}HIS-yiyuan-hospital CLI ${VERSION}${C.reset}`);
  line('网关地址', BASE);
  line('应用 ID', APP_ID);
  line('Node', process.version);
  process.stdout.write(`  ${C.dim}健康检查      ${C.reset}`);
  try {
    const health = await getJson('/health');
    console.log(`${C.green}${health.status}${C.reset}  (${health.service})`);
    console.log(`\n${C.green}✓${C.reset} 环境看起来没问题，可以开始调接口了。`);
  } catch (err) {
    console.log(`${C.red}FAILED${C.reset}`);
    console.log(`\n${C.red}✗${C.reset} ${err.message}`);
    console.log(`${C.yellow}提示${C.reset} 先在本仓库根目录执行 node mock-server/index.js`);
    process.exitCode = 1;
  }
}

async function cmdPatient360(id) {
  if (!id) throw new Error('缺少 patientId，例如 his patient 360 MZ00000143');
  const p = await getJson(`/api/v1/patients/${encodeURIComponent(id)}`);
  console.log(`${C.bold}${p.name}${C.reset}  ${p.gender} / ${p.age}岁  ${C.dim}${p.patientId}${C.reset}`);
  line('就诊卡号', p.mrn);
  line('医保类型', p.insuranceType || '-');
  line('过敏史', p.allergies.length ? p.allergies.map((a) => a.allergen).join('、') : '无');
  line('慢病', p.chronicConditions.join('、') || '无');
  line('最近就诊', p.lastVisit ? `${p.lastVisit.visitTime.slice(0, 10)} ${p.lastVisit.dept}` : '-');
  if (p.labResults.length) {
    console.log(`\n${C.bold}检验异常${C.reset}`);
    for (const l of p.labResults.filter((x) => x.flag !== 'N')) {
      console.log(`  ${C.red}↑${C.reset} ${l.item.padEnd(16)} ${l.value} ${l.unit}  ${C.dim}参考 ${l.ref}${C.reset}`);
    }
  }
  console.log(`\n${C.bold}就诊记录${C.reset}（${p.encounters.length}）`);
  for (const e of p.encounters) {
    console.log(`  ${C.blue}${e.visitTime.slice(0, 10)}${C.reset} ${e.dept} / ${e.doctor}  ${e.diagnosis.join('、')}`);
  }
}

async function cmdQueue(deptCode) {
  const code = deptCode || 'DEPT-RESP';
  const q = await getJson(`/api/v1/queue/${encodeURIComponent(code)}`);
  console.log(`${C.bold}${q.deptName}${C.reset}  当前叫号 ${C.green}${q.calling.queueNo}${C.reset} → ${q.calling.room}`);
  line('候诊人数', `${q.waiting} 人，预计等待 ${q.avgWaitMinutes} 分钟`);
  console.log(`\n${C.bold}候诊队列${C.reset}`);
  for (const i of q.items) console.log(`  ${i.queueNo}  ${C.dim}${i.status}${C.reset}`);
}

async function main() {
  const [cmd, sub, arg] = process.argv.slice(2);

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(`HIS-yiyuan-hospital CLI ${VERSION}

  his doctor                    检查配置与网关连通性
  his patient 360 <patientId>   打印患者 360 摘要
  his queue [deptCode]          打印排队叫号看板

环境变量：
  HIS_BASE_URL   网关地址，默认 http://localhost:8787
  HIS_APP_ID     应用 ID，默认 demo-app

官网：https://www.cnhis.com`);
    return;
  }

  if (cmd === '--version' || cmd === '-v') {
    console.log(VERSION);
    return;
  }

  try {
    if (cmd === 'doctor') return await cmdDoctor();
    if (cmd === 'patient') return await cmdPatient360(arg || sub);
    if (cmd === 'queue') return await cmdQueue(sub);
    throw new Error(`未知命令：${cmd}`);
  } catch (err) {
    console.error(`${C.red}✗${C.reset} ${err.message}`);
    process.exitCode = 1;
  }
}

main();
