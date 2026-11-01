# 快速开始

> 目标：10 分钟内把演示环境跑起来，并调通"患者 360 → 合理用药校验 → 预约取号"这条主链路。

## 1. 环境要求

| 项 | 要求 |
|---|---|
| Node.js | ≥ 18（推荐 20 LTS） |
| 端口 | 8787（可用 `PORT` 覆盖） |
| Docker | 可选，仅方式一需要 |

## 2. 启动演示网关

```bash
git clone https://github.com/jianggong95-netizen/HIS-yiyuan-hospital.git
cd HIS-yiyuan-hospital

# 方式一：Node 直接跑（零依赖）
node mock-server/index.js

# 方式二：Docker
docker compose up -d
```

启动后：

| 地址 | 说明 |
|---|---|
| <http://localhost:8787/> | 患者 360 示例页 |
| <http://localhost:8787/health> | 健康检查 |
| <http://localhost:8787/api/v1/patients/MZ00000143> | 患者 360 接口 |

## 3. 验证接口

```bash
# 健康检查
curl http://localhost:8787/health

# 患者 360
curl http://localhost:8787/api/v1/patients/MZ00000143

# 合理用药校验（患者对青霉素过敏，应返回 ERROR）
curl -X POST http://localhost:8787/api/v1/cds/prescription-check \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "MZ00000143",
    "items": [{ "drugCode": "D0002", "dose": 1, "unit": "粒", "freq": "TID" }]
  }'

# 预约 + 取号
curl -X POST http://localhost:8787/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "MZ00000143",
    "deptCode": "DEPT-RESP",
    "doctorCode": "DOC-0231",
    "visitTime": "2026-11-03T09:30:00+08:00"
  }'
```

预期返回（节选）：

```json
{
  "patientId": "MZ00000143",
  "passed": false,
  "alerts": [
    {
      "level": "ERROR",
      "code": "ALLERGY",
      "message": "患者对「青霉素」过敏，禁用「阿莫西林胶囊」"
    }
  ]
}
```

## 4. 用命令行工具

```bash
node packages/cli/bin/his.js doctor
node packages/cli/bin/his.js patient 360 MZ00000143
node packages/cli/bin/his.js queue DEPT-RESP
```

## 5. 用 SDK

```bash
cd packages/sdk-js
npm install
npm run build
```

```ts
import { HisYiyuanHospitalClient } from '@his-yiyuan-hospital/sdk';

const client = new HisYiyuanHospitalClient({
  baseUrl: 'http://localhost:8787',
  appId: 'demo-app',
  appSecret: 'demo-secret',
});

const p = await client.patient.get360('MZ00000143');
const check = await client.cds.checkPrescription({
  patientId: p.patientId,
  items: [{ drugCode: 'D0001', dose: 1, unit: '片', freq: 'TID' }],
});
console.log(p.name, check.passed, check.alerts);
```

## 6. 接入真实环境

对接真实医院环境前需要准备：

1. **网关地址**：医院提供的开放平台域名（内网 / 专线 / VPN）；
2. **appId / appSecret**：由医院信息科在开放平台申请，不同应用独立授权；
3. **IP 白名单**：调用方出口 IP 需提前报备；
4. **接口授权范围**：按最小必要原则申请，例如仅"患者查询 + 预约"。

> 演示版网关不做鉴权校验，真实环境请勿在浏览器端直接放置 `appSecret`。

## 常见启动问题

| 现象 | 处理 |
|---|---|
| `EADDRINUSE :8787` | 端口被占用，`PORT=8899 node mock-server/index.js` |
| 示例页显示"接口未就绪" | 确认网关已启动，且通过 `http://localhost:8787/` 访问而非直接双击 HTML |
| `fetch is not defined` | Node 版本过低，升级到 18+ |
| Windows 终端中文乱码 | 执行 `chcp 65001` 切换控制台为 UTF-8 |

下一步：[模块清单](./modules.md) · [开放接口](./api/README.md) · [技术架构](./architecture.md)
