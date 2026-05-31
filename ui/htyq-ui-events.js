// 事件链渲染模块
window.HTYQ_UI_EVENTS = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'events', '暂无事件链',
    e => {
        const esc = window.HTYQ_UI_RENDERER_FACTORY.escapeHtml;
        const remaining = (e.totalRounds && e.currentRound) ? (e.totalRounds - e.currentRound) : '?';
        return `<div class="htyq-event-item">
            <strong>${esc(e.name)}</strong> (Lv.${e.level || '?'})<br>
            阶段: ${esc(e.stage || '萌芽')} (${e.currentRound || 0}/${e.totalRounds || '?'})<br>
            <span style="color: #fbbf24;">剩余传导轮数: ${remaining}</span><br>
            触发条件: ${esc(e.trigger || '未知')}<br>
            描述: ${esc(e.desc || '')}
        </div>`;
    }
);
