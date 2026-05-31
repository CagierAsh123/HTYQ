// 团体关系渲染模块
window.HTYQ_UI_RELATIONS = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'factionRelations', '暂无团体关系',
    r => {
        const esc = window.HTYQ_UI_RENDERER_FACTORY.escapeHtml;
        return `<div class="htyq-relation-item">
            ${esc(r.factionA)} ↔ ${esc(r.factionB)}<br>
            关系: ${esc(r.relation)} (${r.level || '?'}/8) | 趋势: ${esc(r.trend || '稳定')}
        </div>`;
    }
);
