## 🌐 活体世界引擎 - SillyTavern 扩展

一个为 SillyTavern 提供的可拖拽悬浮球和活体世界引擎面板。点击地球图标打开面板，两者均可拖拽移动，位置自动保存。适配手机和电脑端。

原始仓库：[710339969/HTYQ](https://github.com/710339969/HTYQ)
Fork 仓库：[CagierAsh123/HTYQ](https://github.com/CagierAsh123/HTYQ)

## 功能

- 地球图标悬浮球，可拖拽
- 点击悬浮球展开活体引擎面板
- 面板可拖拽（通过标题栏）
- 手机端点击面板外部自动收起
- 电脑端需点击 X 或再次点击悬浮球关闭
- 位置记忆（localStorage）
- 完整活体世界引擎：世界推演、势力、事件链、流言、经济、黑市、声誉等

## I1: 代码架构优化

- **htyq-rules.js**（636行）拆分为 `rules/` 目录 13 个文件（最大 111 行）
- **9 个 UI 列表渲染器**抽取统一工厂 `createListViewRenderer`（215行 → 111行）
- **去重**：`entriesToText`、`fetchActiveWorldbooks`、`callRawAPI` 统一到 `HTYQ_UTILS`
- **解耦**：推演引擎通过 `activeContactBanner` 字段与 UI 通信，不再直接操作 DOM
- **清理**：删除根目录死文件 `htyq-ui-settings.js`
- **设置模块拆分**：`settings-core` → core + events，`settings-worldbook` → data + render
- **main.js 拆分**：面板外壳（216行）+ `module-loader.js`（109行）

## 安装方法

1. 进入 SillyTavern 的 `plugins` 文件夹
2. 克隆本仓库：
   ```bash
   cd plugins
   git clone https://github.com/CagierAsh123/HTYQ.git
   ```
