// 设置页面事件绑定（从 settings-core 拆出）
window.__HTYQ_UI_SETTINGS_EVENTS = (function() {
    const utils = window.HTYQ_UTILS;

    function bindEvents(container, STATE, set) {
        const worldbook = window.__HTYQ_UI_SETTINGS_WORLDBOOK;

        // API 模式切换
        container.querySelectorAll('input[name="apiMode"]').forEach(r => r.addEventListener('change', (e) => {
            const customDiv = container.querySelector('#htyq-custom-settings');
            if (customDiv) customDiv.style.display = e.target.value === 'custom' ? 'block' : 'none';
        }));

        const autoPollCb = container.querySelector('#htyq-auto-poll');
        if (autoPollCb) {
            autoPollCb.addEventListener('change', (e) => {
                const intervalGroup = container.querySelector('#htyq-poll-interval-group');
                if (intervalGroup) intervalGroup.style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // 获取模型列表
        const fetchModelsBtn = container.querySelector('#htyq-fetch-models');
        if (fetchModelsBtn) {
            fetchModelsBtn.addEventListener('click', async () => {
                const url = container.querySelector('#htyq-custom-url')?.value.trim();
                const key = container.querySelector('#htyq-custom-key')?.value.trim();
                if (!url) { utils.showFloatingWarning('请填写API URL', true); return; }
                const fetchUrl = url.replace(/\/$/, '') + (url.endsWith('/v1') ? '/models' : '/v1/models');
                try {
                    const resp = await fetch(fetchUrl, { headers: { 'Authorization': `Bearer ${key}` } });
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const data = await resp.json();
                    if (data.data && Array.isArray(data.data)) {
                        const select = container.querySelector('#htyq-model-list');
                        select.innerHTML = '<option value="">-- 选择模型 --</option>';
                        data.data.forEach(m => { const opt = document.createElement('option'); opt.value = m.id; opt.textContent = m.id; select.appendChild(opt); });
                        select.style.display = 'block';
                        select.onchange = () => { const modelInput = container.querySelector('#htyq-custom-model'); if (modelInput) modelInput.value = select.value; };
                        utils.showFloatingWarning(`获取到 ${data.data.length} 个模型`, false);
                    } else utils.showFloatingWarning('无法解析模型列表', true);
                } catch(e) { utils.showFloatingWarning('获取模型失败: ' + e.message, true); }
            });
        }

        // 保存API设置
        const saveApiBtn = container.querySelector('#htyq-save-api');
        if (saveApiBtn) {
            saveApiBtn.addEventListener('click', () => {
                const selected = container.querySelector('input[name="apiMode"]:checked');
                if (selected) set.apiMode = selected.value;
                set.customUrl = container.querySelector('#htyq-custom-url')?.value || '';
                set.customKey = container.querySelector('#htyq-custom-key')?.value || '';
                set.customModel = container.querySelector('#htyq-custom-model')?.value || '';
                STATE.saveGlobalSettings();
                utils.showFloatingWarning('API设置已保存', false);
            });
        }

        // 保存引擎设置
        const saveEngineBtn = container.querySelector('#htyq-save-engine');
        if (saveEngineBtn) {
            saveEngineBtn.addEventListener('click', () => {
                set.autoInject = container.querySelector('#htyq-auto-inject')?.checked || false;
                set.autoPollMode = container.querySelector('#htyq-auto-poll')?.checked ? 'auto' : 'manual';
                const interval = container.querySelector('#htyq-poll-interval');
                if (interval) set.autoPollInterval = parseInt(interval.value) || 1;
                const strategySelect = container.querySelector('#htyq-evo-strategy');
                if (strategySelect) set.evolutionStrategy = strategySelect.value;
                const customStepsInput = container.querySelector('#htyq-custom-steps');
                if (customStepsInput) set.customSteps = parseInt(customStepsInput.value) || 3;
                STATE.saveGlobalSettings();
                utils.showFloatingWarning('引擎设置已保存', false);
            });
        }

        // 保存 DLC
        const saveDlcsBtn = container.querySelector('#htyq-save-dlcs');
        if (saveDlcsBtn) {
            saveDlcsBtn.addEventListener('click', () => {
                document.querySelectorAll('#htyq-dlcs-container input[type="checkbox"]').forEach(cb => {
                    set.enabledDlcs[cb.dataset.dlc] = cb.checked;
                });
                STATE.saveGlobalSettings();
                utils.showFloatingWarning('DLC设置已保存', false);
            });
        }

        // 重置当前聊天世界
        const resetWorldBtn = container.querySelector('#htyq-reset-world');
        if (resetWorldBtn) {
            resetWorldBtn.addEventListener('click', () => {
                if (confirm('重置当前聊天世界？这将清除所有进度，不可恢复！')) {
                    STATE.resetCurrentWorld();
                    if (window.HTYQ_UI && window.HTYQ_UI.refresh) window.HTYQ_UI.refresh();
                    utils.showFloatingWarning('当前聊天世界已重置', false);
                }
            });
        }

        // 导出世界状态
        const exportBtn = container.querySelector('#htyq-export-world');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const dataStr = JSON.stringify(STATE.worldState, null, 2);
                const blob = new Blob([dataStr], {type:'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `htyq_world_${STATE.getCurrentChatId()}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        // 导入世界状态
        const importBtn = container.querySelector('#htyq-import-world');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        try {
                            const imported = JSON.parse(ev.target.result);
                            Object.assign(STATE.worldState, imported);
                            STATE.saveWorldState();
                            if (window.HTYQ_UI && window.HTYQ_UI.refresh) window.HTYQ_UI.refresh();
                            utils.showFloatingWarning('世界状态导入成功', false);
                        } catch(err) { utils.showFloatingWarning('导入失败：无效的JSON', true); }
                    };
                    reader.readAsText(file);
                };
                input.click();
            });
        }

        // 世界书导入按钮
        const autoImportBtn = container.querySelector('#htyq-auto-import-btn');
        if (autoImportBtn) {
            autoImportBtn.addEventListener('click', async () => {
                autoImportBtn.disabled = true;
                autoImportBtn.textContent = '⏳ 检测中...';
                await worldbook.autoImportActiveWorldbooks();
                autoImportBtn.disabled = false;
                autoImportBtn.textContent = '🚀 自动导入激活的世界书';
                const listContainer = container.querySelector('#htyq-worlds-list');
                if (listContainer) worldbook.renderWorldList(listContainer, STATE.worldState, () => {});
            });
        }

        const manualImportBtn = container.querySelector('#htyq-manual-import-btn');
        if (manualImportBtn) {
            manualImportBtn.addEventListener('click', async () => {
                manualImportBtn.disabled = true;
                manualImportBtn.textContent = '⏳ 加载...';
                await worldbook.manualImportFromST();
                manualImportBtn.disabled = false;
                manualImportBtn.textContent = '📖 手动选择世界书';
                const listContainer = container.querySelector('#htyq-worlds-list');
                if (listContainer) worldbook.renderWorldList(listContainer, STATE.worldState, () => {});
            });
        }

        // 策略下拉框初始化
        const strategySelect = container.querySelector('#htyq-evo-strategy');
        const customStepsGroup = container.querySelector('#htyq-custom-steps-group');
        if (strategySelect && customStepsGroup) {
            strategySelect.value = set.evolutionStrategy || 'single';
            const toggleCustom = () => {
                customStepsGroup.style.display = strategySelect.value === 'custom' ? 'block' : 'none';
            };
            strategySelect.addEventListener('change', toggleCustom);
            toggleCustom();
        }
        const customStepsInput = container.querySelector('#htyq-custom-steps');
        if (customStepsInput) customStepsInput.value = set.customSteps || 3;

        // 初始化世界书列表
        const listContainer = container.querySelector('#htyq-worlds-list');
        if (listContainer) worldbook.renderWorldList(listContainer, STATE.worldState, () => {});
    }

    return { bindEvents };
})();
