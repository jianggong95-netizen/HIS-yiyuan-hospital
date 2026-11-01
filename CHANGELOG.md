# 更新日志

本文件记录演示仓库的变更。产品完整版本的发布记录随交付包提供。

## [2.6.0-preview.3] - 2026-11-01

### 新增
- 患者 360 示例页 `examples/patient-360`，含检验异常高亮与就诊时间线
- SDK 新增 `cds.checkPrescription()`，覆盖过敏 / 剂量校验
- CLI 新增 `his doctor` 环境自检命令

### 变更
- 仓库以 **Apache License 2.0** 开源，新增 `NOTICE`（版权归属 + 商标声明），源码文件补充 SPDX 头
- Mock 网关改为零依赖实现，`node mock-server/index.js` 即可启动
- 统一错误结构为 `{ code, message, requestId }`
- 品牌统一为 **HIS-yiyuan-hospital**：npm 包 `@his-yiyuan-hospital/*`、SDK 类 `HisYiyuanHospitalClient`、CLI 命令 `his`、接口头 `X-HIS-AppId` / `HIS-Sign`
- 「能力全景」改为按六大能力域分组的矢量图 `assets/capability-map.svg`，替换原气泡式宣传图
- 演示与体验入口统一指向官网 [www.cnhis.com](https://www.cnhis.com)

### 修复
- 修复示例页通过 `file://` 打开时的跨域失败（改为由网关托管）

## [2.6.0-preview.2] - 2026-10-18

### 新增
- 排队叫号看板接口 `GET /queue/{deptCode}`
- 预约创建接口 `POST /appointments`，返回排队号与诊室

### 变更
- 患者接口字段 `age` 由字符串改为数字

## [2.6.0-preview.1] - 2026-09-30

### 新增
- 首个公开演示版本：患者 360、预约、CDS 三个业务域
- 技术文档：快速开始、架构、模块清单、部署、FAQ

---

返回：[README](./README.md)
