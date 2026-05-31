// 势力渲染模块
window.HTYQ_UI_FACTIONS = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'factions', '暂无势力',
    f => {
        const esc = window.HTYQ_UI_RENDERER_FACTORY.escapeHtml;
        return `<div class="htyq-faction-item">
            <strong>${esc(f.name)}</strong> (区域: ${esc(f.region || '未知')})<br>
            目标: ${esc(f.current_goal || '无')}<br>
            进度: ${esc(f.progress || '未知')}<br>
            凝聚力: ${esc(f.cohesion || '未知')} | 资源: ${esc(f.resources || '未知')}<br>
            对主角关注: ${esc(f.attention_to_user || '无')}<br>
            核心人物: ${esc(f.core_character || '无')}
        </div>`;
    }
);
