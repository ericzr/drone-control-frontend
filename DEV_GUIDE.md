# 智慧无人设施控制后台 — 当前工作说明

## 1. 项目概述

基于 `wemirr-platform` 前后端框架，建设面向政务协同场景的智慧无人设施控制后台。支持 7 大行业应用场景（森林防火、交通巡查、市政巡检、环境监测、光伏巡检、热力巡检、安全生产）。

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

### 2.1 指挥中心 `/situation-board`

全域态势大屏，深色主题。

- 7 大应用场景一键切换（森林防火、交通巡查、市政巡检、环境监测、光伏巡检、热力巡检、安全生产）
- 切换联动：统计面板、设备列表、AI 检测类别、告警图片、地图标注全部跟随场景变化
- 数据统计面板（4 指标 + 设备在线率进度条）
- 无人机监控卡片（电量/链路柱状条）
- AI 识别统计（按检测类别的横向进度图）
- AI 告警图片画廊（2×2 网格，带级别标签、置信度、点击放大预览）
- 告警类型标签
- 全屏模式按钮
- 集成 `useMap` Mock 地图（场景切换时重新渲染标注）
- 底部状态栏（场景模式、坐标、设备在线数、待处理告警数）

### 2.2 控制台总览 `/overview`

业务工作台，所有模块入口集中展示。

- 4 个核心统计卡片（纳管设备、今日任务、待复核告警、在线模型）
- 6 个功能模块入口卡片（指挥中心、调度中心、设备中心、飞控中心、事件中心、AI 模型中心）
- 快捷入口 3×4 网格（12 个常用功能，带 Iconify 图标 + 网格分隔线）
- 最新告警列表（5 条，带级别标签 + 位置 + 场景 + 时间）
- 设备概览（4 类设备在线率进度条）

### 2.3 调度中心 `/dispatch`

| 子页面 | 路径 | 类型 | 说明 |
|--------|------|------|------|
| 综合态势 | `/dispatch/situation` | 自定义 + useMap | 统计卡片 + 地图（含标注/航线/围栏）+ 态势指标 + 机场概览 + 工具栏（测距/测面/围栏/地图源切换） |
| 视频监控 | `/dispatch/video-wall` | 自定义 | 多通道视频墙布局 + 布局模式切换 |
| 任务调度 | `/dispatch/task` | 自定义 | 任务调度队列 + 统计 + 时间线 |
| 任务统计 | `/dispatch/statistics` | 自定义 | 月度统计仪表盘：按类型/部门/时段统计，完成率进度条 |
| 时空影像 | `/dispatch/imagery` | Fast Crud | 飞行影像记录 CRUD，含航点数、照片数、覆盖范围、数据量 |

### 2.4 设备中心 `/device`

7 类设备完整 CRUD（Fast Crud + Mock 数据）：

| 子页面 | 路径 | Mock 数据量 |
|--------|------|------------|
| 无人机管理 | `/device/uav` | 7 条 |
| 机巢管理 | `/device/dock` | 5 条 |
| 机器狗管理 | `/device/robot-dog` | 4 条 |
| 无人车管理 | `/device/vehicle` | 4 条 |
| 摄像头管理 | `/device/camera` | 6 条 |
| 传感器管理 | `/device/sensor` | 5 条 |
| 充电站管理 | `/device/charger` | 4 条 |

### 2.5 飞控中心 `/flight`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 航线规划 | `/flight/route-plan` | Fast Crud |
| 计划管理 | `/flight/plan` | Fast Crud |
| 飞行作业 | `/flight/operation` | 自定义（实时监控面板 + 任务列表） |
| 虚拟驾驶舱 | `/flight/cockpit` | 自定义（HUD + 飞行控制 + 云台控制 + useMap 航线地图） |
| 飞行影像 | `/flight/imagery` | Fast Crud |
| 需求提报 | `/flight/demand` | Fast Crud |

### 2.6 事件中心 `/event`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 事件列表 | `/event/list` | Fast Crud |
| 事件复核 | `/event/review` | Fast Crud |
| 工单管理 | `/event/workorder` | Fast Crud |
| 地图视图 | `/event/map-view` | 自定义 + useMap（事件分布地图 + 筛选 + 事件卡片） |
| 事件报告 | `/event/report` | 自定义（按场景统计 + 闭环率 + 导出） |

### 2.7 飞手管理 `/pilot`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 飞手档案 | `/pilot/roster` | Fast Crud（7 条，含编号、技能等级、飞行时长/架次） |
| 资质证书 | `/pilot/certificate` | Fast Crud（8 条，CAAC/AOPA/UTC/内部认证） |
| 签到记录 | `/pilot/attendance` | Fast Crud（考勤类型 + 打卡地点） |
| 培训计划 | `/pilot/training` | Fast Crud（理论/实操/演练/安全/新机型） |

### 2.8 数字模型 `/geo-data`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 底图配置 | `/geo-data/basemap` | Fast Crud（高德/天地图/Mars3D/Cesium，含坐标系） |
| 地理资源 | `/geo-data/resource` | Fast Crud（正射/倾斜/DEM/矢量/点云/标注） |
| 图层管理 | `/geo-data/layer` | Fast Crud（可见性、透明度、层级） |

### 2.9 安全设置 `/settings`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 禁飞区管理 | `/settings/no-fly-zone` | Fast Crud（永久/限时/限高/审批飞行） |
| 系统参数 | `/settings/params` | 表单页（系统名称、地图配置、飞行参数、告警策略） |

### 2.10 AI 模型中心 `/ai-center`

| 子页面 | 路径 | 类型 |
|--------|------|------|
| 模型库 | `/ai-center/model-repo` | Fast Crud（7 个模型，YOLO/RT-DETR/Qwen2-VL/CLIP） |
| 部署管理 | `/ai-center/deploy` | Fast Crud（7 个推理服务，TensorRT/vLLM/ONNX） |
| 评估报告 | `/ai-center/evaluation` | 自定义（mAP/Precision/Recall/FPS + 各类别评估表） |
| 算法商城 | `/ai-center/marketplace` | 自定义（算法卡片 + 搜索 + 订阅） |

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
├── 指挥中心          /situation-board     (order: 119)
├── 控制台总览        /overview            (order: 120)
├── 调度中心          /dispatch            (order: 121)
│   ├── 综合态势
│   ├── 视频监控
│   ├── 任务调度
│   ├── 任务统计
│   └── 时空影像
├── 设备中心          /device              (order: 122)
│   ├── 无人机管理 ... 充电站管理 (7 个)
├── 飞控中心          /flight              (order: 123)
│   ├── 航线规划 ... 需求提报 (6 个)
├── 事件中心          /event               (order: 124)
│   ├── 事件列表 ... 事件报告 (5 个)
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

## 5. 下一步开发建议

### 第一优先级：接入真实 API

1. 将 `createMockCrud` 替换为真实 HTTP 请求（`defHttp`）
2. 优先接入：设备分页、告警分页、任务分页、模型列表
3. 统一错误处理与权限拦截

### 第二优先级：深化核心交互

1. 设备详情页（维护记录、挂载信息、告警日志）
2. 事件影像对比（分屏/卷帘）
3. 航线规划地图编辑器
4. 禁飞区地图绘制（集成 useMap 的 enableDraw）

### 第三优先级：集成真实地图

1. 配置 `VITE_MAP_TYPE=amap` 或 `tianditu`，填入 Key
2. 实现 `AMapAdapter` / `TiandituAdapter` 的完整 SDK 调用
3. 替换综合态势、虚拟驾驶舱、事件地图视图中的 Mock 地图

### 第四优先级：后端微服务

1. 在 `wemirr-platform-v4-dev` 中新增 `uav-device`、`uav-flight`、`uav-event` 等领域服务
2. 接入 Nacos 配置中心
3. 接入 ZLMediaKit 视频流
