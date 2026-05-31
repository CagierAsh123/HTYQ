// 外交事件渲染模块
window.HTYQ_UI_DIPLOMACY = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'diplomaticEvents', '本轮无外交事件',
    e => {
        const esc = window.HTYQ_UI_RENDERER_FACTORY.escapeHtml;
        return `<div class="htyq-card">
            <h3>${esc(e.name || '外交事件')}</h3>
            <div>${esc(e.description || '')}</div>
        </div>`;
    }
);
