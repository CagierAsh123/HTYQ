// UI 渲染工厂 — 消除列表渲染器重复样板
window.HTYQ_UI_RENDERER_FACTORY = (function() {
    const STATE = window.HTYQ_STATE;
    const utils = window.HTYQ_UTILS;
    const escapeHtml = utils.escapeHtml;

    function createListViewRenderer(dataKey, emptyMessage, itemRenderer) {
        return {
            render: function(container) {
                const items = STATE.worldState[dataKey];
                if (!items || !items.length) {
                    container.innerHTML = '<div class="htyq-card">' + (emptyMessage || '暂无数据') + '</div>';
                    return;
                }
                container.innerHTML = items.map(itemRenderer).join('');
            }
        };
    }

    return { createListViewRenderer, escapeHtml };
})();
