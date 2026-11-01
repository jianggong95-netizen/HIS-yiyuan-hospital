# 私有化部署

## 交付形态

| 形态 | 适用 | 说明 |
|---|---|---|
| 院内私有化 | 二级 / 三级医院 | 全部服务部署在院内机房，数据不出院 |
| 专有云 | 集团 / 医共体 | 区域云资源池，按租户隔离 |
| 混合模式 | 医共体牵头医院 | 核心院内、互联网业务上云，数据分级同步 |

## 环境要求（参考基线）

### 小型（≤ 300 床）

| 用途 | 配置 | 数量 |
|---|---|---|
| 应用服务器 | 16C / 32G / 500G SSD | 3 |
| 数据库服务器 | 16C / 64G / 2T SSD | 2（主备） |
| 影像存储 | 40T 可用 | 1 套 |

### 中型（300–800 床）

| 用途 | 配置 | 数量 |
|---|---|---|
| 应用节点 | 32C / 128G | 3–6 |
| 数据库 | 32C / 128G / 4T SSD | 2 主备 |
| 缓存 | 8C / 32G | 3 |
| 消息队列 | 8C / 32G | 3 |
| 影像存储 | 100T 可用 | 1 套 |

### 大型（800 床以上 / 集团）

建议采用 Kubernetes 集群 + 独立存储池，按业务域划分命名空间，数据库主从 + 只读副本分担报表压力。

## 部署步骤

### 1. 基础环境

```bash
# 关闭 SELinux / 配置时间同步 / 内核参数
timedatectl set-ntp true
sysctl -w net.core.somaxconn=32768
sysctl -w net.ipv4.tcp_tw_reuse=1

# 安装容器运行时
dnf install -y docker-ce docker-compose-plugin
systemctl enable --now docker
```

### 2. 拉取镜像

镜像由坐标软件交付团队提供（离线包 / 私有仓库），演示仓库不含生产镜像。

```bash
docker load -i his-os-2.6.0.tar
docker images | grep his
```

### 3. 配置

```yaml
# /opt/his/config/app.yaml
server:
  port: 8080
  context-path: /api

datasource:
  url: jdbc:mysql://10.10.1.11:3306/his?useUnicode=true&characterEncoding=utf8
  username: his_app
  password: ${DB_PASSWORD}     # 从环境变量或密钥管理服务读取

redis:
  cluster: 10.10.1.21:6379,10.10.1.22:6379,10.10.1.23:6379

mq:
  namesrv: 10.10.1.31:9876

empi:
  match-threshold-auto: 92     # 自动合并阈值
  match-threshold-review: 78   # 进入人工确认
```

### 4. 初始化

```bash
# 建库建表 + 基础字典
./his-cli db init --config /opt/his/config/app.yaml
./his-cli dict import --file ./dict/standard-2026.sql

# 初始化组织与院区
./his-cli org create --code H001 --name "示例人民医院" --level 3
```

### 5. 启动

```bash
docker compose -f /opt/his/docker-compose.prod.yml up -d
docker compose ps
curl http://127.0.0.1:8080/actuator/health
```

### 6. 上线前检查

- [ ] 主数据导入完整（科室 / 人员 / 药品 / 收费项 / 诊断手术）
- [ ] 医保接口联调通过（挂号、收费、结算、退费）
- [ ] 集成平台接口全部绿灯，消息积压为 0
- [ ] 号源、排班、价格生效日期核对
- [ ] 双轨运行方案与回退预案确认
- [ ] 培训与考核完成（分角色）
- [ ] 备份任务与监控告警已配置

## 信创适配矩阵

| 类别 | 已适配 |
|---|---|
| CPU | 鲲鹏 920、飞腾 S2500、海光、兆芯 |
| 操作系统 | 麒麟 V10、统信 UOS、openEuler |
| 数据库 | 达梦 DM8、人大金仓 KingbaseES、OceanBase、GaussDB |
| 中间件 | 东方通 TongWeb、宝兰德、金蝶 Apusic |
| 浏览器 | 奇安信、360 安全浏览器（信创版）、Firefox ESR |

## 备份与容灾

| 对象 | 策略 |
|---|---|
| 数据库 | 每日全备 + binlog 增量，保留 30 天；异地副本每周一份 |
| 对象存储 | 双副本，影像冷数据分层 |
| 配置 | Git 版本化 + 变更审批 |
| 演练 | 每季度一次故障切换演练，记录 RTO/RPO 实测值 |

## 升级

- 小版本：滚动更新，业务不停机；
- 大版本：灰度院区 → 观察 7 天 → 全院推广；
- 数据库变更走 Flyway 脚本，禁止手工改表；
- 升级前自动快照，失败可一键回滚。

---

返回：[README](../README.md) · [技术架构](./architecture.md)
