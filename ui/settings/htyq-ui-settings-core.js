// 设置页面核心渲染（事件绑定拆至 events 模块）
window.__HTYQ_UI_SETTINGS_CORE = (function() {
    const STATE = window.HTYQ_STATE;
    const utils = window.HTYQ_UTILS;
    const escapeHtml = utils.escapeHtml;

    async function render(container) {
        const set = STATE.globalApiSettings;
        const worldState = STATE.worldState;
        if (!worldState.manualWorlds) worldState.manualWorlds = [];

        container.innerHTML = `
            <div class="htyq-settings-section">
                <h3>🔌 API 设置</h3>
                <div class="htyq-option-row"><label><input type="radio" name="apiMode" value="tavern" ${set.apiMode === 'tavern' ? 'checked' : ''}> 使用酒馆自带模型</label></div>
                <div class="htyq-option-row"><label><input type="radio" name="apiMode" value="custom" ${set.apiMode === 'custom' ? 'checked' : ''}> 使用自定义API</label></div>
                <div id="htyq-custom-settings" style="display: ${set.apiMode === 'custom' ? 'block' : 'none'}; margin-left:20px;">
                    <input type="text" id="htyq-custom-url" placeholder="API Base URL" value="${escapeHtml(set.customUrl)}" style="width:100%; margin-bottom:5px;">
                    <input type="password" id="htyq-custom-key" placeholder="API Key" value="${escapeHtml(set.customKey)}" style="width:100%; margin-bottom:5px;">
                    <input type="text" id="htyq-custom-model" placeholder="模型名称" value="${escapeHtml(set.customModel)}" style="width:100%; margin-bottom:5px;">
                    <button id="htyq-fetch-models" class="htyq-small-btn">获取模型列表</button>
                    <select id="htyq-model-list" style="display:none; width:100%; margin-top:5px;"></select>
                </div>
                <button id="htyq-save-api" class="htyq-small-btn">保存API设置</button>
            </div>

            <div class="htyq-settings-section">
                <h3>⚙️ 引擎设置</h3>
                <div class="htyq-option-row"><label><input type="checkbox" id="htyq-auto-inject" ${set.autoInject ? 'checked' : ''}> 自动注入世界摘要到AI</label></div>
                <div class="htyq-option-row"><label><input type="checkbox" id="htyq-auto-poll" ${set.autoPollMode === 'auto' ? 'checked' : ''}> 自动推演 (每轮对话后)</label></div>
                <div id="htyq-poll-interval-group" style="display: ${set.autoPollMode === 'auto' ? 'block' : 'none'}; margin-left:20px;">
                    每 <input type="number" id="htyq-poll-interval" value="${set.autoPollInterval}" min="1" style="width:70px;"> 轮推演一次
                </div>
                <div class="htyq-option-row" style="margin-top:12px;">
                    <label style="margin-right: 8px;">📞 推演调用策略：</label>
                    <select id="htyq-evo-strategy" style="background:#0f172a; color:#e2e8f0; border:1px solid #334155; border-radius:6px; padding:4px 8px;">
                        <option value="single">一次性调用（省token，兼容模式）</option>
                        <option value="two_pass">两次调用（核心+扩展）</option>
                        <option value="custom">自定义多次调用</option>
                    </select>
                </div>
                <div id="htyq-custom-steps-group" style="display: none; margin-left: 24px; margin-top: 8px;">
                    每轮最多调用 <input type="number" id="htyq-custom-steps" value="${set.customSteps || 3}" min="1" max="10" style="width:70px; background:#0f172a; color:white; border:1px solid #334155; border-radius:4px; padding:4px;"> 次API（按分组顺序）
                </div>
                <button id="htyq-save-engine" class="htyq-small-btn" style="margin-top:12px;">保存引擎设置</button>
            </div>

            <div class="htyq-settings-section">
                <h3>📚 世界书导入管理器</h3>
                <div style="margin-bottom:12px; display:flex; gap:8px; flex-wrap:wrap;">
                    <button id="htyq-auto-import-btn" class="htyq-small-btn" style="background:#10b981;">🚀 自动导入激活的世界书</button>
                    <button id="htyq-manual-import-btn" class="htyq-small-btn" style="background:#8b5cf6;">📖 手动选择世界书</button>
                </div>
                <div id="htyq-worlds-list" style="max-height:300px; overflow-y:auto;"></div>
                <div id="htyq-world-preview" style="margin-top:16px; border-top:1px solid #334155; padding-top:12px;">
                    <div style="color:#94a3b8; text-align:center; font-size:12px;">点击「测试」按钮，此处将显示世界书完整内容</div>
                </div>
                <div style="margin-top:12px; font-size:12px; color:#fbbf24;">
                    💡 提示：<br>
                    - 「自动导入激活的世界书」：自动检测当前角色绑定和全局启用的世界书，并导入（标记为自动）。<br>
                    - 「手动选择世界书」：从所有世界书中选择，可导入整本或选择特定条目（标记为手动）。<br>
                    - 切换角色/聊天时，会自动清理旧的角色/全局世界书，并重新导入新的。<br>
                    - 支持多选世界书后点击「删除选中」批量删除。<br>
                    - 勾选「启用」后，该世界书的内容会在推演时被 AI 读取。<br>
                    - 点击「测试」可预览完整内容。
                </div>
            </div>

            <div class="htyq-settings-section">
                <h3>🎲 DLC 开关</h3>
                <div id="htyq-dlcs-container" style="display:grid; grid-template-columns:repeat(2,1fr); gap:6px;"></div>
                <button id="htyq-save-dlcs" class="htyq-small-btn">保存DLC设置</button>
            </div>

            <div class="htyq-settings-section">
                <h3>📁 数据管理</h3>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button id="htyq-reset-world" class="htyq-small-btn" style="background:#ef4444;">重置当前聊天世界</button>
                    <button id="htyq-export-world" class="htyq-small-btn" style="background:#3b82f6;">导出当前世界状态</button>
                    <button id="htyq-import-world" class="htyq-small-btn" style="background:#3b82f6;">导入当前世界状态</button>
                </div>
            </div>
        `;

        // 渲染 DLC 列表
        const dlcMap = {
            world_engine: '活体世界引擎', group_dynamics: '社会群体法则', active_contact: '主动接触判定',
            revenge: '恩怨录', blackmarket: '黑市', economy: '经济脉搏', accident: '意外事件',
            reputation: '声誉系统', power_peak: '权力顶点', group_relation: '团体关系', secret_asset: '信息黑盒'
        };
        const dlcContainer = container.querySelector('#htyq-dlcs-container');
        if (dlcContainer) {
            dlcContainer.innerHTML = '';
            for (const [key, label] of Object.entries(dlcMap)) {
                const checked = set.enabledDlcs[key] !== false;
                dlcContainer.innerHTML += `<label class="htyq-checkbox-label"><input type="checkbox" data-dlc="${key}" ${checked ? 'checked' : ''}> ${label}</label>`;
            }
        }

        // 委托事件绑定
        window.__HTYQ_UI_SETTINGS_EVENTS.bindEvents(container, STATE, set);
    }

    return { render };
})();
