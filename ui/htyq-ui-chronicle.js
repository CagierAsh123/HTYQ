// 编年史渲染模块
window.HTYQ_UI_CHRONICLE = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'chronicles', '暂无编年史记录',
    c => `<div class="htyq-chronicle-item">
        <div class="htyq-chronicle-title">${window.HTYQ_UI_RENDERER_FACTORY.escapeHtml(c.title)}</div>
        <div class="htyq-chronicle-content">${window.HTYQ_UI_RENDERER_FACTORY.escapeHtml(c.content)}</div>
        <div class="htyq-chronicle-date">第${c.round}轮 · ${new Date(c.timestamp).toLocaleString()}</div>
    </div>`
);
