// 流言渲染模块
window.HTYQ_UI_RUMORS = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'rumors', '暂无流言',
    r => {
        const esc = window.HTYQ_UI_RENDERER_FACTORY.escapeHtml;
        return `<div class="htyq-rumor-item">
            <strong>${esc(r.type || '流言')}</strong><br>
            ${esc(r.content || r.text || '')}<br>
            <small>范围: ${esc(r.scope || '未知')} | 可信度: ${esc(r.credibility || '未知')} | 来源: ${esc(r.source || '未知')} | 热度: ${esc(r.heat || '中')}</small>
        </div>`;
    }
);
