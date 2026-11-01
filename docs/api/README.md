# 开放接口说明

演示网关前缀：`http://localhost:8787/api/v1`
生产环境：由医院开放平台分配，形如 `https://open.<hospital>.cn/api/v1`

## 鉴权

| 项 | 说明 |
|---|---|
| 传输头 | `X-HIS-AppId: <appId>` |
| 签名头 | `Authorization: HIS-Sign <appId>:<nonce>:<timestamp>:<signature>` |
| 签名算法 | `HMAC-SHA256(appSecret, appId + nonce + timestamp + body)`，小写十六进制 |
| 时间窗 | ±5 分钟，超出拒绝 |
| 幂等 | 写接口支持 `X-HIS-RequestId`，同 ID 24 小时内只生效一次 |

## 通用响应

```json
{
  "code": "OK",
  "message": "success",
  "requestId": "req_20261101_9f2c1a",
  "data": {}
}
```

| HTTP | code | 含义 |
|---|---|---|
| 200 / 201 | `OK` | 成功 |
| 400 | `INVALID_ARGUMENT` | 参数缺失或格式错误 |
| 401 | `UNAUTHORIZED` | 签名错误 / 时间戳过期 |
| 403 | `FORBIDDEN` | 应用未获该接口授权 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 429 | `RATE_LIMITED` | 超出频次限制（默认 20 QPS/应用） |
| 500 | `INTERNAL_ERROR` | 服务异常，可重试 |

## 接口清单

### 患者与就诊

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/patients` | 患者列表 / 关键字检索 |
| `GET` | `/patients/{patientId}` | 患者 360（基本信息 + 过敏 + 就诊 + 检验） |
| `GET` | `/patients/{patientId}/encounters` | 就诊记录 |
| `GET` | `/patients/{patientId}/orders` | 医嘱列表（演示版未实现） |
| `GET` | `/patients/{patientId}/documents` | 病历文书（演示版未实现） |

### 预约与排队

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/appointments` | 创建预约，返回排队号与诊室 |
| `GET` | `/appointments/{appointmentId}` | 查询预约状态 |
| `POST` | `/appointments/{appointmentId}/cancel` | 取消预约 |
| `GET` | `/queue/{deptCode}` | 科室排队叫号看板 |

### 临床辅助决策

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/cds/prescription-check` | 合理用药：过敏、剂量、配伍、医保限定 |
| `POST` | `/cds/critical-value/ack` | 危急值确认（演示版未实现） |
| `GET` | `/cds/pathways/{patientId}` | 临床路径入径评估（演示版未实现） |

### 运营与主数据

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/dict/departments` | 科室字典 |
| `GET` | `/dict/drugs` | 药品字典 |
| `GET` | `/dict/charge-items` | 收费项目字典 |
| `GET` | `/metrics/overview` | 院长驾驶舱指标（演示版未实现） |

## 分页约定

| 参数 | 说明 |
|---|---|
| `page` | 从 1 开始，默认 1 |
| `size` | 每页条数，默认 20，上限 200 |
| `sort` | 例：`visitTime,desc` |

```json
{
  "total": 128,
  "page": 1,
  "size": 20,
  "items": []
}
```

## 示例：患者 360

```bash
curl "http://localhost:8787/api/v1/patients/MZ00000143" \
  -H "X-HIS-AppId: demo-app"
```

```json
{
  "patientId": "MZ00000143",
  "mrn": "0101019900307258",
  "name": "李依依",
  "gender": "女",
  "age": 33,
  "allergies": [{ "allergen": "青霉素", "reaction": "皮疹", "level": "重度" }],
  "chronicConditions": ["原发性高血压 2 级"],
  "lastVisit": {
    "dept": "呼吸内科",
    "doctor": "马利哲",
    "diagnosis": ["急性上呼吸道感染", "原发性高血压"]
  },
  "encounters": [],
  "labResults": []
}
```

## 事件订阅（Webhook）

生产版本支持事件推送，演示版未内置实现，仅说明事件类型：

| 事件 | 触发时机 |
|---|---|
| `patient.created` | 新建患者主索引 |
| `encounter.finished` | 就诊结束 |
| `order.placed` | 医嘱下达 |
| `critical_value.reported` | 危急值上报 |
| `appointment.checked_in` | 预约报到 |

订阅方需在 5 秒内返回 `2xx`，失败按 30s / 2min / 10min 三次退避重推。

---

返回：[README](../README.md) · [快速开始](./quickstart.md)
