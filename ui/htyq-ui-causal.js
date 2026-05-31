// 因果链渲染模块
window.HTYQ_UI_CAUSAL = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'causalChain', '暂无因果链追踪',
    c => {
        const esc = window.HTYQ_UI_RENDERER_FACTORY.escapeHtml;
        return `<div class="htyq-card">
            <h3>🔗 ${esc(c.rumorOrEvent)}</h3>
            <div><strong>进展:</strong> ${esc(c.progress)}</div>
            <div><strong>本轮体现:</strong> ${esc(c.manifestation)}</div>
        </div>`;
    }
);
