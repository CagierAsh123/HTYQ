// 世界书模块 — 聚合入口（数据操作 + 列表渲染拆至独立子模块）
window.__HTYQ_UI_SETTINGS_WORLDBOOK = (function() {
    const data = window.__HTYQ_UI_SETTINGS_WORLDBOOK_DATA;
    const render = window.__HTYQ_UI_SETTINGS_WORLDBOOK_RENDER;

    return {
        getActiveWorldbooks: data.getActiveWorldbooks,
        importWholeWorldbook: data.importWholeWorldbook,
        importToHtyq: data.importToHtyq,
        autoImportActiveWorldbooks: data.autoImportActiveWorldbooks,
        manualImportFromST: data.manualImportFromST,
        renderWorldList: render.renderWorldList
    };
})();
