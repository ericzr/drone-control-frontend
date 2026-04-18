# Vercel 预览部署说明

本文用于将 `drone-control-frontend` 仓库接入 Vercel，实现：

- 推送分支后自动生成 Preview 预览
- 合并到主分支后自动更新 Production

## 1. 新建项目

在 Vercel 中选择导入 GitHub 仓库：

- 仓库：`ericzr/drone-control-frontend`

## 2. 项目配置

导入后请使用以下配置：

- Root Directory: `./`
- Framework Preset: `Other`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm -F @vben/web-antd build`
- Output Directory: `apps/web-antd/dist`

仓库根目录已提供：

- [`vercel.json`](/Users/apple/Downloads/项目代码管理/大航蜂-drone/gengxin/wemirr-platform-ui-v4-dev/vercel.json)

可直接让 Vercel 自动读取。

## 3. Node 与包管理器

本仓库要求：

- Node.js `>=20.12.0`
- pnpm `10.x`

建议在 Vercel 项目设置中确认：

- Node.js Version: `20` 或更高

## 4. 环境变量

前端预览环境建议至少配置以下变量：

- `VITE_GLOB_API_URL=https://cloud.battcn.com/api`
- `VITE_ROUTER_HISTORY=hash`
- `VITE_GITEE_INTERCEPT=false`
- `VITE_MAP_TYPE=mock`

仓库中也已提供：

- [`apps/web-antd/.env.preview`](/Users/apple/Downloads/项目代码管理/大航蜂-drone/gengxin/wemirr-platform-ui-v4-dev/apps/web-antd/.env.preview)

如果 Vercel 使用 `preview` 模式构建，可直接读取这些值。

## 5. 推荐绑定方式

推荐开启：

- Pull Request Previews
- Production Branch: `main`

这样后续流程会变成：

1. 推送新分支
2. 创建 PR
3. Vercel 自动生成 Preview 链接
4. 合并到 `main` 后自动更新正式站

## 6. 当前说明

当前 GitHub 仓库已经有预览分支：

- `codex/preview-20260418`

如果你现在完成 Vercel 仓库绑定，Vercel 会开始对这个分支执行首次 Preview 构建。
