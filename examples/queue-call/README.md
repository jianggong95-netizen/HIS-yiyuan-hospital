# 排队叫号对接示例

演示如何把科室叫号信息推到候诊大屏 / 微信端。

## 运行

```bash
# 先启动演示网关
node mock-server/index.js

# 另开一个终端，轮询叫号
node examples/queue-call/call.js DEPT-RESP
```

输出：

```text
[09:55:12] 呼吸内科 | 请 A025 号到 2 号诊室 | 候诊 7 人，预计 11 分钟
```

## 接口

```http
GET /api/v1/queue/DEPT-RESP
```

```json
{
  "deptCode": "DEPT-RESP",
  "deptName": "呼吸内科",
  "calling": { "queueNo": "A025", "room": "2 号诊室", "doctor": "马利哲" },
  "waiting": 7,
  "avgWaitMinutes": 11,
  "items": [
    { "queueNo": "A026", "patientId": "MZ00000144", "status": "NEXT" }
  ]
}
```

## 生产建议

| 项 | 建议 |
|---|---|
| 轮询频率 | 大屏 3–5 秒；微信端改为 WebSocket 推送 |
| 幂等展示 | 只播报 `calling.queueNo` 变化时，避免重复语音 |
| 隐私 | 大屏只显示排队号，不显示姓名与就诊信息 |
| 兜底 | 接口异常时保留上一次快照，避免大屏黑屏 |

---

返回：[README](../../README.md)
