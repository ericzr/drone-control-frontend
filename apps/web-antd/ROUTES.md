# 大航蜂无人机业务路由索引

源文件：[src/router/routes/modules/drone-control.ts](src/router/routes/modules/drone-control.ts)  
另有指挥中心：[src/router/routes/modules/situation-board.ts](src/router/routes/modules/situation-board.ts)、[data-screen.ts](src/router/routes/modules/data-screen.ts)（重定向）。

**关联文档**：业务全量推进清单见仓库根目录 [DEV_PLAN.md](../DEV_PLAN.md) **§14**；前端工程与体验专项见 [docs/FRONTEND-OPTIMIZATION-PLAN.md](docs/FRONTEND-OPTIMIZATION-PLAN.md)。

| 路径前缀 | 说明 | 数据 |
|----------|------|------|
| `/overview` | 控制台总览 | mock / 待接 API |
| `/dispatch/*` | 调度中心（态势、视频墙、任务、统计、影像、资源、应急） | 任务页已接机巢起飞 session 演示 |
| `/device/*` | 设备中心（含机巢、无人机等 CRUD） | Fast Crud mock |
| `/device/dock-monitor` | 机巢四分屏监控 | **hideInMenu**，`activePath: /device/dock` |
| `/flight/*` | 飞控中心（空域资源、航线、计划、座舱等） | mock / 空域资源中心原型已接入 |
| `/applications/*` | 专题应用（当前为林草巡检专题） | mock / 平台底座 + 部门专题样板 |
| `/event/*` | 事件中心 | mock |
| `/pilot/*` | 飞手管理 | mock |
| `/geo-data/*` | 数字模型 | mock |
| `/settings/*` | 安全设置 | mock |
| `/ai-center/*` | AI 模型中心（数据源、媒体库、分析任务、告警规则、在线检测、历史、模型库、部署、评估、商城） | mock / session 演示 |
| `/situation-board` | 指挥中心 + 数据驾驶舱 | `useMap` 演示 |

## 空域资源中心（Wave 1 原型）

- 页面：`/flight/airspace-resource`
- 能力：空域资源地图、时间窗口占用、申请冲突提示、放飞前检查摘要
- 作用：作为“一网统飞”链路的前端起点，承接后续飞行申请、审批、授权中心
- 关联：`/settings/no-fly-zone`、`/flight/route-apply`

## 专题应用（Wave 1 样板）

- 页面：`/applications/forestry`
- 定位：建立在“一网统飞”平台底座之上的部门垂直作业工作台，不替代全域统飞主链
- 首期场景：林草巡检，覆盖火情发现、违规垦荒、资源破坏、病虫害监测等任务编排与处置联动
- 关联：`/dispatch/task`、`/event/list`、`/ai-center/task`、`/flight/airspace-resource`

## 机巢起飞会话（演示）

- 写入：`views/wemirr/drone-control/_services/takeoff-task-store.ts`（`sessionStorage`）
- 消费：`/dispatch/task` 首次进入时 `consumePendingTakeoffTasks()` 合并到列表

## AI 数据源会话（演示）

- 存储：`views/wemirr/drone-control/_services/ai-data-source-store.ts`（`sessionStorage`）
- 页面：`/ai-center/data-source`
- 能力：实时流 / 点位 / 飞行影像统一台账，启停、连通性测试、任务编排入口
- 关联：`/ai-center/task`、`/ai-center/media-library`、`/ai-center/detection`、`/ai-center/detect-history`

## AI 分析任务会话（演示）

- 存储：`views/wemirr/drone-control/_services/ai-analysis-task-store.ts`（`sessionStorage`）
- 页面：`/ai-center/task`
- 能力：分析任务模板、新建向导、任务状态切换、立即执行、复制任务
- 关联：`/ai-center/detection`、`/ai-center/detect-history`

## AI 告警规则会话（演示）

- 存储：`views/wemirr/drone-control/_services/ai-alert-rule-store.ts`（`sessionStorage`）
- 页面：`/ai-center/rule`
- 能力：规则模板、新建规则、启停、模拟触发、关联任务/事件闭环入口
- 关联：`/ai-center/task`、`/event/list`

## AI 媒体库会话（演示）

- 存储：`views/wemirr/drone-control/_services/ai-media-library-store.ts`（`sessionStorage`）
- 页面：`/ai-center/media-library`
- 能力：自动回传 / 飞行影像归档 / 本地批量上传统一入库，多维筛选，生命周期管理，送检与关联任务入口
- 关联：`/ai-center/task`、`/ai-center/detection`、`/dispatch/imagery`、`/flight/imagery`

## AI 检测历史会话（演示）

- 存储：`views/wemirr/drone-control/_services/ai-detect-history-store.ts`（`sessionStorage`）
- 页面：`/ai-center/detect-history`
- 能力：历史回放、智能检索、关键片段时间轴、目标概览、转事件入口
- 关联：`/ai-center/media-library`、`/ai-center/task`、`/event/detail`

## API 占位

- `src/api/drone/device.ts`、`flight-task.ts`：接口未就绪时 `Promise.reject` 提示，便于后续替换为 `defHttp`。
