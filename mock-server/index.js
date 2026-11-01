#!/usr/bin/env node
/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
/**
 * HIS-yiyuan-hospital —— 演示用 Mock 网关
 * ------------------------------------------------------------
 * 零依赖，仅用于本地演示与接口联调，不包含任何生产逻辑。
 * 启动：node mock-server/index.js
 * 默认端口：8787（可用 PORT 环境变量覆盖）
 */
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.join(__dirname, 'data');
const EXAMPLE_DIR = path.join(__dirname, '..', 'examples', 'patient-360');

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
const patients = readJson('patients.json');
const dictionary = readJson('dictionary.json');

const API_PREFIX = '/api/v1';

const json = (res, status, body) => {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
};

const notFound = (res, message) => json(res, 404, { code: 'NOT_FOUND', message });

/** 极简 CORS，方便示例页直接调用 */
const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-HIS-AppId');
};

const findPatient = (id) => patients.find((p) => p.patientId === id);

const routes = {
  'GET /health': (_req, res) => {
    json(res, 200, {
      status: 'UP',
      service: 'his-mock-gateway',
      version: '2.6.0-preview',
      time: new Date().toISOString(),
    });
  },

  'GET /api/v1/patients': (_req, res) => {
    json(res, 200, {
      total: patients.length,
      items: patients.map((p) => ({
        patientId: p.patientId,
        name: p.name,
        gender: p.gender,
        age: p.age,
        dept: p.lastVisit && p.lastVisit.dept,
      })),
    });
  },

  // 患者 360 视图
  'GET /api/v1/patients/:id': (req, res, params) => {
    const p = findPatient(params.id);
    if (!p) return notFound(res, `patient ${params.id} not found`);
    json(res, 200, p);
  },

  // 就诊记录
  'GET /api/v1/patients/:id/encounters': (_req, res, params) => {
    const p = findPatient(params.id);
    if (!p) return notFound(res, `patient ${params.id} not found`);
    json(res, 200, { patientId: p.patientId, total: p.encounters.length, items: p.encounters });
  },

  // 排队叫号看板
  'GET /api/v1/queue/:deptCode': (_req, res, params) => {
    const board = dictionary.queue.find((q) => q.deptCode === params.deptCode);
    if (!board) return notFound(res, `dept ${params.deptCode} not found`);
    json(res, 200, board);
  },

  // 合理用药 / 医保限定校验
  'POST /api/v1/cds/prescription-check': (req, res) => {
    const { patientId, items = [] } = req.body || {};
    const p = findPatient(patientId);
    if (!p) return notFound(res, `patient ${patientId} not found`);

    const alerts = [];
    for (const item of items) {
      const drug = dictionary.drugs.find((d) => d.code === item.drugCode);
      if (!drug) {
        alerts.push({ level: 'ERROR', code: 'DRUG_NOT_EXIST', message: `药品编码不存在：${item.drugCode}` });
        continue;
      }
      if (p.allergies.some((a) => drug.allergen && a.allergen === drug.allergen)) {
        alerts.push({
          level: 'ERROR',
          code: 'ALLERGY',
          message: `患者对「${drug.allergen}」过敏，禁用「${drug.name}」`,
        });
      }
      if (Number(item.dose) > drug.maxDose) {
        alerts.push({
          level: 'WARN',
          code: 'OVER_DOSE',
          message: `「${drug.name}」单次剂量 ${item.dose}${item.unit} 超出建议上限 ${drug.maxDose}${drug.unit}`,
        });
      }
    }

    json(res, 200, {
      patientId,
      passed: alerts.every((a) => a.level !== 'ERROR'),
      alerts,
      checkedAt: new Date().toISOString(),
    });
  },

  // 创建预约
  'POST /api/v1/appointments': (req, res) => {
    const { patientId, deptCode, doctorCode, visitTime } = req.body || {};
    if (!patientId || !deptCode || !visitTime) {
      return json(res, 400, {
        code: 'INVALID_ARGUMENT',
        message: 'patientId / deptCode / visitTime 为必填项',
      });
    }
    const seq = String(Math.floor(Math.random() * 900) + 100);
    json(res, 201, {
      appointmentId: `AP${Date.now().toString().slice(-8)}`,
      patientId,
      deptCode,
      doctorCode: doctorCode || null,
      visitTime,
      queueNo: `A${seq}`,
      room: `门诊 ${Math.floor(Math.random() * 9) + 2} 楼 ${seq.slice(0, 1)} 号诊室`,
      status: 'BOOKED',
    });
  },
};

const matchRoute = (method, pathname) => {
  for (const key of Object.keys(routes)) {
    const [m, pattern] = key.split(' ');
    if (m !== method) continue;
    const patternParts = pattern.split('/');
    const pathParts = pathname.split('/');
    if (patternParts.length !== pathParts.length) continue;
    const params = {};
    const ok = patternParts.every((seg, i) => {
      if (seg.startsWith(':')) {
        params[seg.slice(1)] = decodeURIComponent(pathParts[i]);
        return true;
      }
      return seg === pathParts[i];
    });
    if (ok) return { handler: routes[key], params };
  }
  return null;
};

const server = http.createServer((req, res) => {
  withCors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 演示页静态资源
  if (url.pathname === '/' || url.pathname === '/demo' || url.pathname === '/demo/') {
    const file = path.join(EXAMPLE_DIR, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  const matched = matchRoute(req.method, url.pathname);
  if (!matched) return notFound(res, `${req.method} ${url.pathname} not mapped`);

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
  });
  req.on('end', () => {
    const ctx = { body: null };
    if (raw) {
      try {
        ctx.body = JSON.parse(raw);
      } catch {
        return json(res, 400, { code: 'BAD_JSON', message: '请求体不是合法 JSON' });
      }
    }
    try {
      matched.handler({ ...req, body: ctx.body }, res, matched.params);
    } catch (err) {
      json(res, 500, { code: 'INTERNAL_ERROR', message: String(err && err.message) });
    }
  });
});

server.listen(PORT, () => {
  console.log(`[HIS-yiyuan-hospital] mock gateway listening on http://localhost:${PORT}`);
  console.log(`[HIS-yiyuan-hospital] demo page:  http://localhost:${PORT}/`);
  console.log(`[HIS-yiyuan-hospital] api base:   http://localhost:${PORT}${API_PREFIX}`);
});
