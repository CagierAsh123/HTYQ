// 已出场角色状态渲染模块
window.HTYQ_UI_CHARACTERS = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'characterStates', '暂无角色状态',
    c => {
        const esc = window.HTYQ_UI_RENDERER_FACTORY.escapeHtml;
        return `<div class="htyq-card">
            <h3>${esc(c.name)} <span style="color:#fbbf24;">(${esc(c.importance || '普通')})</span></h3>
            <div><strong>状态:</strong> ${esc(c.status || '未知')}</div>
            <div><strong>情绪:</strong> ${esc(c.emotion || '平静')}</div>
            <div><strong>对主角态度:</strong> ${esc(c.attitudeToUser || '中立')}</div>
            <div><strong>关系网:</strong> ${esc(c.relationshipMap || '无')}</div>
        </div>`;
    }
);
