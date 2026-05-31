// 黑市渲染模块
window.HTYQ_UI_BLACKMARKET = window.HTYQ_UI_RENDERER_FACTORY.createListViewRenderer(
    'blackMarket', '暂无黑市交易',
    item => {
        const esc = window.HTYQ_UI_RENDERER_FACTORY.escapeHtml;
        return `<div class="htyq-blackmarket-item">
            <strong>${esc(item.type)}</strong><br>
            ${esc(item.description)}<br>
            价格: ${esc(item.price)} | 风险: ${esc(item.risk)}
        </div>`;
    }
);
