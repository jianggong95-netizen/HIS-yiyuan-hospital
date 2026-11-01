#!/usr/bin/env node
/*
 * Copyright 2026 深圳市坐标软件集团有限公司
 * Shenzhen Coordinate Software Group Co., Ltd. · https://www.cnhis.com
 *
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
 */
/**
 * 排队叫号大屏对接示例
 * 轮询 /api/v1/queue/{deptCode}，打印当前叫号与候诊队列。
 * 运行：node examples/queue-call/call.js DEPT-RESP
 */
'use strict';

const BASE = process.env.HIS_BASE_URL || 'http://localhost:8787';
const deptCode = process.argv[2] || 'DEPT-RESP';

async function tick() {
  try {
    const res = await fetch(`${BASE}/api/v1/queue/${deptCode}`);
    const q = await res.json();
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    console.log(
      `[${time}] ${q.deptName} | 请 ${q.calling.queueNo} 号到 ${q.calling.room} | ` +
        `候诊 ${q.waiting} 人，预计 ${q.avgWaitMinutes} 分钟`,
    );
  } catch (err) {
    console.warn(`[warn] 拉取失败：${err.message}`);
  }
}

tick();
setInterval(tick, 5000).unref();
