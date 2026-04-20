# 云界空域OS — 当前工作说明

## 1. 项目概述

基于 `wemirr-platform` 前后端框架，建设面向市 / 区县治理场景的低空无人设施协同作业平台。系统以“一网统飞”为顶层理念，强调区域内无人机、机场、无人车、机器人、摄像头等资产统一纳管、统一调度、统一闭环，支持 7 大行业应用场景（森林防火、交通巡查、市政巡检、环境监测、光伏巡检、热力巡检、安全生产）。

### 项目资产

| 子项目 | 定位 | 技术栈 |
|--------|------|--------|
| `wemirr-platform-ui-v4-dev` | 前端控制后台 | Vue 3 + TypeScript + Vben Admin 5.x + Ant Design Vue 4 + Fast Crud |
| `wemirr-platform-v4-dev` | 后端微服务平台 | Spring Boot + Spring Cloud + Nacos + Sa-Token |
| `c124` | AI 算法资产 | YOLOv11 + PyQt6 桌面检测应用 |

### 开发预览

- 地址：`http://127.0.0.1:5666/`
- 启动：`cd wemirr-platform-ui-v4-dev && npx pnpm run dev:antd`
- 布局：`sidebar-nav`（单侧边栏，一级可展开，二级直接显示）

---

## 2. 已完成的功能模块

### 2.1 态势中心 `/situation-board`

统一的全域态势入口，深色主题，支持**视图模式切换**（指挥中心 / 数据驾驶舱）。

**指挥中心视图：**

- 7 大应用场景一键切换（森林防火、交通巡查、市政巡检、环境监测、光伏巡检、热力巡检、安全生产）
- 切换联动：统计面板、设备列表、AI 检测类别、告警图片、地图标注全部跟随场景变化
- 数据统计面板（4 指标 + 设备在线率进度条）
- 无人机监控卡片（电量/链路柱状条）
- AI 识别统计（按检测类别的横向进度图）
- AI 告警图片画廊（2×2 网格，带级别标签、置信度、点击放大预览）
- AI 问数助手面板（聊天式数据查询 + 图表可视化）
- 全屏模式按钮
- 集成 `useMap` Mock 地图（场景切换时重新渲染标注）
- 底部状态栏（场景模式、坐标、设备在线数、待处理告警数）

**数据驾驶舱视图：**

- 三栏布局（设备概览 / 任务统计 / 告警趋势 | 核心 KPI + 地图 | AI 识别 / 部门排行 / 实时告警）
- 4 个核心 KPI 翻牌卡（纳管设备、今日飞行、AI 识别、待处理告警）
- 告警趋势柱状图（周维度）
- 部门排行进度条
- 实时告警自动滚动列表

> 旧地址 `/data-screen` 已重定向至 `/situation-board`，兼容旧书签。

### 2.2 控制台总览 `/overview`

业务工作台，所有模块入口集中展示。

- 4 个核心统计卡片（纳管设备、今日任务、待复核告警、在线模型）
- 7 个功能模块入口卡片（指挥中心、调度中心、设备中心、飞控中心、专题应用、事件中心、AI 模型中心）
- 快捷入口网格（含林草巡检专题等高频页面入口）
- 最新告警列表（5 条，点击直达事件详情页）
- 设备概览（4 类设备在线率进度条，支持 CSV 导出）
- 通知中心（未读标记）
- 本月日程（任务/培训/维护）

### 2.3 调度中心 `/dispatch`

| 子页面 | 路径 | 类型 | 说明 |
|--------|------|------|------|
| 综合态势 | `/dispatch/situation` | 自定义 + useMap | 统计卡片 + 地图（含标注/航线/围栏）+ 态势指标 + 机场概览 + 工具栏 |
| 视频监控 | `/dispatch/video-wall` | 自定义 | 多通道视频墙布局 + 布局模式切换 |
| 任务调度 | `/dispatch/task` | 自定义 | 任务调度队列 + 统计 + 时间线 |
| 任务统计 | `/dispatch/statistics` | 自定义 | 月度统计仪表盘 |
| 时空影像 | `/dispatch/imagery` | Fast Crud | 飞行影像记录 CRUD |
| 资源调度 | `/dispatch/resource` | 自定义 | 资源调度管理 |
| 应急指挥 | `/dispatch/emergency` | 自定义 | 应急指挥管理 |

### 2.4 设备中心 `/device`

7 类设备完整 CRUD（Fast Crud + Mock 数据），操作列含"详情"跳转：

| 子页面 | 路径 | Mock 数据量 |
|--------|------|------------|
| 无人机管理 | `/device/uav` | 8 条 |
| 机巢管理 | `/device/dock` | 5 条 |
| 机器狗管理 | `/device/robot-dog` | 4 条 |
| 无人车管理 | `/device/vehicle` | 4 条 |
| 摄像头管理 | `/device/camera` | 6 条 |
| 传感器管理 | `/device/sensor` | 5 条 |
| 充电站管理 | `/device/charger` | 4 条 |
| 设备详情 | `/device/detail?id=xxx` | 隐藏菜单 |

### 2.5 飞控中心 `/flight`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 航线规划 | `/flight/route-plan` | Fast Crud |
| 航线申请 | `/flight/route-apply` | Fast Crud |
| 计划管理 | `/flight/plan` | Fast Crud |
| 飞行作业 | `/flight/operation` | 自定义（实时监控面板 + 任务列表） |
| 虚拟驾驶舱 | `/flight/cockpit` | 自定义（HUD + 飞行控制 + 云台控制 + useMap 航线地图） |
| 飞行影像 | `/flight/imagery` | Fast Crud |
| 需求提报 | `/flight/demand` | Fast Crud |

### 2.6 事件中心 `/event`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 事件首页 | `/event` | 自定义（共享闭环态势首页，支持快捷确认 / 驳回 / 转工单） |
| 事件列表 | `/event/list` | Fast Crud（操作列含"详情"跳转） |
| 事件复核 | `/event/review` | Fast Crud |
| 工单管理 | `/event/workorder` | Fast Crud |
| 地图视图 | `/event/map-view` | 自定义 + useMap（共享事件地图、场景筛选、点位聚焦） |
| 事件报告 | `/event/report` | 自定义（按场景统计 + 闭环率 + 导出） |
| 事件详情 | `/event/detail?id=xxx` | 自定义（隐藏菜单） |

补充说明：

- 事件 / 复核 / 工单 已接入共享会话闭环状态，支持检测历史转事件、事件转工单、工单状态回写事件状态。
- 事件首页与事件地图页已切换为共享事件态势视图，和复核页、工单页、报告页共用同一份状态源。
- 事件首页、地图、复核、工单、报告已补充统一上下文筛选条，支持场景 / 来源跨页保留与快速切换。
- 事件详情页与工单详情页也已接入统一上下文条，跨页查看明细时可继续保留当前场景 / 来源语境。
- 事件详情页已升级为共享闭环详情中枢，补充影像对比、处置轨迹、证据摘要与关联工单摘要。
- 事件复核页已补充证据摘要、处置轨迹、地图聚焦与详情/工单联动，支持带事件编号直接打开复核抽屉。
- 工单页已支持按事件 / 场景 / 来源上下文筛选，支持从报告、地图、详情页带参进入并自动定位关联工单。
- 报告页已支持按场景筛选，并导出“场景汇总 + 工单明细”联合 CSV，闭环摘要可直达对应工单。
- 报告页已补充汇报封面、重点摘要卡片、工单明细预览与打印预览入口，更适合客户汇报场景。
- 工单详情已补充处置证据、闭环摘要与处置留痕，适合客户演示处置闭环。

### 2.7 专题应用 `/applications`

当前采用“平台底座 + 部门专题”的产品形态推进，首个垂直样板为林草巡检专题：

| 子页面 | 路径 | 类型 | 说明 |
|--------|------|------|------|
| 林草巡检专题 | `/applications/forestry` | 自定义 + useMap | 面向林草巡检部门的专题作业工作台，联动机场、无人机、摄像头、地面巡护与 AI 识别 |

### 2.8 飞手管理 `/pilot`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 飞手档案 | `/pilot/roster` | Fast Crud |
| 资质证书 | `/pilot/certificate` | Fast Crud |
| 签到记录 | `/pilot/attendance` | Fast Crud |
| 培训计划 | `/pilot/training` | Fast Crud |

### 2.9 数字模型 `/geo-data`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 底图配置 | `/geo-data/basemap` | Fast Crud |
| 地理资源 | `/geo-data/resource` | Fast Crud |
| 图层管理 | `/geo-data/layer` | Fast Crud |

### 2.10 安全设置 `/settings`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 禁飞区管理 | `/settings/no-fly-zone` | Fast Crud |
| 系统参数 | `/settings/params` | 表单页 |

### 2.11 AI 模型中心 `/ai-center`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 数据源管理 | `/ai-center/data-source` | 自定义（实时流 / 点位 / 飞行影像统一台账） |
| 媒体库 | `/ai-center/media-library` | 自定义（自动汇聚 + 批量上传 + 多维筛选 + 生命周期管理） |
| 分析任务 | `/ai-center/task` | 自定义（任务模板 + 新建向导 + 调度管理 + 立即执行） |
| 告警规则 | `/ai-center/rule` | 自定义（规则模板 + 条件配置 + 启停 + 模拟触发） |
| 在线检测 | `/ai-center/detection` | 自定义（图片/视频/实时流检测演示） |
| 检测历史 | `/ai-center/detect-history` | 自定义（历史回放 + 智能检索 + 关键片段 + 转事件） |
| 模型库 | `/ai-center/model-repo` | Fast Crud |
| 部署管理 | `/ai-center/deploy` | Fast Crud |
| 评估报告 | `/ai-center/evaluation` | 自定义 |
| 算法商城 | `/ai-center/marketplace` | 自定义 |

---

## 3. 基础设施

### 3.1 地图适配层 `src/utils/map/`

| 文件 | 说明 |
|------|------|
| `types.ts` | `IMapAdapter` 接口 + MapType/MapOptions/MarkerOptions 等类型 |
| `useMap.ts` | Vue Composable，工厂模式创建/销毁/切换地图 |
| `adapters/mock.ts` | Canvas 绘制的 Mock 地图（网格、标注、航线、多边形、HUD） |
| `adapters/amap.ts` | 高德地图适配器骨架（含 GCJ-02/WGS-84 坐标转换） |
| `adapters/tianditu.ts` | 天地图适配器骨架 |
| `adapters/mars3d.ts` | Mars3D 适配器骨架 |

环境变量：`.env.development` 中 `VITE_MAP_TYPE=mock`

### 3.2 Mock 数据体系

- `device/_mock.ts`：通用 `createMockCrud()` 函数 + 设备相关字典
- 各模块 `_mock.ts`：继承 `createMockCrud`，定义模块专属字典
- 所有 CRUD 页面使用本地 Mock 数据，无需后端即可完整演示

### 3.3 暗色模式

全部页面已适配 Tailwind `dark:` 变体，样式使用 `var(--ant-color-*)` CSS 变量跟随主题。

---

## 4. 菜单结构

```
├── 态势中心          /situation-board     (order: 119)
│   └── 视图切换：指挥中心 / 数据驾驶舱
├── 控制台总览        /overview            (order: 120)
├── 调度中心          /dispatch            (order: 121)
│   ├── 综合态势 / 视频监控 / 任务调度 / 任务统计
│   ├── 时空影像 / 资源调度 / 应急指挥
├── 设备中心          /device              (order: 122)
│   ├── 无人机 ... 充电站 (7 个) + 设备详情 (隐藏)
├── 飞控中心          /flight              (order: 123)
│   ├── 航线规划 ... 需求提报 (7 个)
├── 专题应用          /applications        (order: 123.5)
│   ├── 林草巡检专题 (首期样板)
├── 事件中心          /event               (order: 124)
│   ├── 事件列表 ... 事件报告 (5 个) + 事件详情 (隐藏)
├── 飞手管理          /pilot               (order: 125)
│   ├── 飞手档案 ... 培训计划 (4 个)
├── 数字模型          /geo-data            (order: 126)
│   ├── 底图配置 ... 图层管理 (3 个)
├── 安全设置          /settings            (order: 127)
│   ├── 禁飞区管理、系统参数
├── AI 模型中心       /ai-center           (order: 128)
│   ├── 模型库 ... 算法商城 (4 个)
├── 组织架构 / 权限管理 / 设置中心 等 (系统原有模块)
```

---

## 5. 已验证的跳转链路

| 起点 | 终点 | 方式 |
|------|------|------|
| 设备列表（无人机等） | `/device/detail?id=xxx` | CRUD 操作列"详情"按钮 |
| 事件列表 | `/event/detail?id=xxx` | CRUD 操作列"详情"按钮 |
| 控制台总览-告警条目 | `/event/detail?id=xxx` | 行点击 |
| 控制台总览-模块卡片 | 各模块首页 | 卡片点击 |
| 控制台总览-快捷入口 | 高频页面入口（含林草巡检专题） | 网格项点击 |
| 设备详情-查看实时画面 | `/flight/cockpit` | 按钮 |
| 旧地址 `/data-screen` | `/situation-board` | 路由 redirect |

---

## 6. 优化迭代记录

> 更新时间：2026-04-13

### 6.1 已完成修复

1. **调度中心-任务调度页无法打开** — `Timeline.Item` 改为 `TimelineItem` 并补充导入
2. **设备中心-无人机管理页无数据** — 移除 `Spin` 外层包裹
3. **数据驾驶舱与指挥中心合并** — 统一入口 `/situation-board`，header 内置视图切换器
4. **页面跳转链路补全** — 设备/事件列表新增"详情"操作列，总览告警直达事件详情
5. **路由与权限清理** — 删除重复 `/data-screen` 路由，`access.ts` 移除废弃项，菜单标题更新

### 6.2 变更文件清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `situation-board/index.vue` | 改造 | 新增 viewMode 切换 + DataScreenView 渲染 |
| `situation-board/components/DataScreenView.vue` | 新建 | 数据驾驶舱三栏布局组件 |
| `dispatch/task/index.vue` | 修复 | TimelineItem 导入 |
| `device/uav/index.vue` | 修复+增强 | 移除 Spin、传入 router context |
| `device/uav/crud.tsx` | 增强 | 新增 rowHandle.detail 按钮 |
| `event/list/index.vue` | 增强 | 传入 router context |
| `event/list/crud.tsx` | 增强 | 新增 rowHandle.detail 按钮 |
| `overview/index.vue` | 增强 | 告警点击跳转事件详情 |
| `router/routes/modules/drone-control.ts` | 清理 | 移除 /data-screen 路由块 |
| `router/routes/modules/data-screen.ts` | 改造 | 改为 redirect 兼容旧地址 |
| `router/routes/modules/situation-board.ts` | 更新 | 菜单标题改为"态势中心" |
| `router/access.ts` | 清理 | 移除 DroneDataScreen |

---

## 7. 后续迭代方向

### 第一优先级：接入真实 API

1. 将 `createMockCrud` 替换为真实 HTTP 请求（`defHttp`）
2. 优先接入：设备分页、告警分页、任务分页、模型列表
3. 统一错误处理与权限拦截

### 第二优先级：深化核心交互

1. 设备详情页接口数据（按 id 查询，替换当前硬编码）
2. 事件影像对比（分屏/卷帘）
3. 航线规划地图编辑器
4. 禁飞区地图绘制（集成 useMap 的 enableDraw）
5. 其余设备类型（机巢/机器狗/摄像头等）CRUD 补充"详情"跳转

### 第三优先级：集成真实地图

1. 配置 `VITE_MAP_TYPE=amap` 或 `tianditu`，填入 Key
2. 实现 `AMapAdapter` / `TiandituAdapter` 的完整 SDK 调用
3. 替换综合态势、虚拟驾驶舱、事件地图视图中的 Mock 地图

### 第四优先级：后端微服务

1. 在 `wemirr-platform-v4-dev` 中新增 `uav-device`、`uav-flight`、`uav-event` 等领域服务
2. 接入 Nacos 配置中心
3. 接入 ZLMediaKit 视频流
