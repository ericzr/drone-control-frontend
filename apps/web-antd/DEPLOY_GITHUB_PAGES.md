# GitHub Pages 预览部署说明

当前仓库已补充 GitHub Actions 工作流：

- [`.github/workflows/deploy-preview-pages.yml`](/Users/apple/Downloads/项目代码管理/大航蜂-drone/gengxin/wemirr-platform-ui-v4-dev/.github/workflows/deploy-preview-pages.yml)

它用于把预览分支自动部署到 GitHub Pages 的子目录下。

## 1. 触发方式

以下分支推送后会自动触发预览部署：

- `codex/**`
- `preview/**`

例如：

- `codex/preview-20260418`

## 2. 预览地址规则

预览部署不会覆盖主站，而是发布到 Pages 子目录：

```text
https://<github-user>.github.io/<repo>/previews/<branch-name>/
```

对当前仓库来说，分支 `codex/preview-20260418` 的预览地址会是：

```text
https://ericzr.github.io/drone-control-frontend/previews/codex-preview-20260418/
```

## 3. 构建方式

工作流会在仓库根目录执行：

```bash
pnpm build:antd
```

这样可以正确处理 monorepo 内部依赖构建，不会再出现只构建 `web-antd` 导致的 `@vben-core/design` 解析失败。

## 4. Pages 基础路径

工作流会为每个预览分支自动注入：

- `VITE_BASE=/<repo>/previews/<branch-name>/`

因此打包后的静态资源会自动指向对应的预览目录。

## 5. 注意事项

- 现有主站发布逻辑可以继续保留
- 这个工作流只负责“预览分支”发布
- 路由模式使用 `hash`，因此页面深链刷新不会依赖服务端回退
