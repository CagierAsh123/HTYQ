// 世界书数据操作模块（从 worldbook 拆出）
window.__HTYQ_UI_SETTINGS_WORLDBOOK_DATA = (function() {
    const STATE = window.HTYQ_STATE;
    const utils = window.HTYQ_UTILS;
    const helpers = window.__HTYQ_UI_SETTINGS_HELPERS;

    async function getActiveWorldbooks() {
        return await utils.fetchActiveWorldbooks();
    }

    async function importWholeWorldbook(worldName, entries, silent = false, source = 'manual') {
        if (!entries || !entries.length) {
            if (!silent) utils.showFloatingWarning(`世界书"${worldName}"无有效内容`, true);
            return false;
        }
        const textContent = helpers.entriesToText(entries);
        return await importToHtyq(worldName, textContent, silent, source);
    }

    async function importToHtyq(worldName, content, silent = false, source = 'manual') {
        const worldState = STATE.worldState;
        if (!worldState.manualWorlds) worldState.manualWorlds = [];
        const existing = worldState.manualWorlds.find(w => w.name === worldName);
        if (existing) {
            if (!silent && !confirm(`世界书"${worldName}"已存在，是否覆盖？`)) return false;
            existing.content = content;
            existing.enabled = true;
            existing.source = source;
        } else {
            worldState.manualWorlds.push({ name: worldName, enabled: true, content, source });
        }
        STATE.saveWorldState();
        if (!silent) utils.showFloatingWarning(`成功导入世界书"${worldName}"`, false);
        return true;
    }

    async function autoImportActiveWorldbooks() {
        const worldState = STATE.worldState;
        if (!worldState.manualWorlds) worldState.manualWorlds = [];

        const activeBooks = await getActiveWorldbooks();
        const activeNames = new Set(activeBooks.map(b => b.name));

        const beforeCount = worldState.manualWorlds.length;
        worldState.manualWorlds = worldState.manualWorlds.filter(w => {
            if (w.source !== 'character' && w.source !== 'global') return true;
            return activeNames.has(w.name);
        });
        const deletedCount = beforeCount - worldState.manualWorlds.length;
        if (deletedCount > 0) {
            console.log(`[HTYQ] 清理了 ${deletedCount} 个失效的自动导入世界书`);
            STATE.saveWorldState();
        }

        if (activeBooks.length === 0) {
            utils.showFloatingWarning('未检测到任何激活的世界书（角色绑定或全局启用）', true);
            return;
        }
        let success = 0;
        for (const book of activeBooks) {
            const source = book.source === 'character' ? 'character' : 'global';
            if (await importWholeWorldbook(book.name, book.entries, true, source)) success++;
        }
        utils.showFloatingWarning(`自动同步完成：成功 ${success} / ${activeBooks.length}`, false);
    }

    async function manualImportFromST() {
        const allNames = await helpers.getWorldbookNames();
        if (!allNames.length) {
            utils.showFloatingWarning('未找到任何世界书，请先在 ST 中创建世界书', true);
            return;
        }
        const escapeHtml = utils.escapeHtml;
        const selectedWorld = await new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:10005; display:flex; align-items:center; justify-content:center;';
            const dialog = document.createElement('div');
            dialog.style.cssText = 'background:#1e2937; border-radius:12px; padding:20px; width:320px; max-width:90%; border:1px solid #334155;';
            dialog.innerHTML = `
                <h3 style="margin:0 0 12px 0; font-size:16px; color:#c084fc;">📖 选择世界书</h3>
                <select id="htyq-world-select" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #334155; border-radius:6px; padding:8px;">
                    <option value="">-- 请选择 --</option>
                    ${allNames.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('')}
                </select>
                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
                    <button id="htyq-cancel-btn" style="background:#334155; border:none; color:#e2e8f0; padding:6px 12px; border-radius:6px;">取消</button>
                    <button id="htyq-whole-btn" style="background:#8b5cf6; border:none; color:white; padding:6px 12px; border-radius:6px;">导入整本</button>
                    <button id="htyq-entries-btn" style="background:#10b981; border:none; color:white; padding:6px 12px; border-radius:6px;">选择条目</button>
                </div>
            `;
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            const close = (result) => { overlay.remove(); resolve(result); };
            dialog.querySelector('#htyq-cancel-btn').onclick = () => close(null);
            dialog.querySelector('#htyq-whole-btn').onclick = () => {
                const name = dialog.querySelector('#htyq-world-select').value;
                if (!name) { utils.showFloatingWarning('请选择一个世界书', true); return; }
                close({ type: 'whole', name });
            };
            dialog.querySelector('#htyq-entries-btn').onclick = () => {
                const name = dialog.querySelector('#htyq-world-select').value;
                if (!name) { utils.showFloatingWarning('请选择一个世界书', true); return; }
                close({ type: 'entries', name });
            };
            overlay.onclick = (e) => { if (e.target === overlay) close(null); };
        });
        if (!selectedWorld) return;
        if (selectedWorld.type === 'whole') {
            const data = await helpers.loadWorldbookContent(selectedWorld.name);
            if (data && data.entries.length) {
                await importWholeWorldbook(selectedWorld.name, data.entries, false, 'manual');
            } else {
                utils.showFloatingWarning(`世界书"${selectedWorld.name}"无有效内容`, true);
            }
        } else {
            const data = await helpers.loadWorldbookContent(selectedWorld.name);
            if (!data || !data.entries.length) {
                utils.showFloatingWarning(`世界书"${selectedWorld.name}"无有效条目`, true);
                return;
            }
            const selectedEntries = await helpers.showEntrySelectionDialog(selectedWorld.name, data.entries);
            if (!selectedEntries || selectedEntries.length === 0) return;
            const customName = `${selectedWorld.name} (选中条目 ${selectedEntries.length})`;
            const textContent = helpers.entriesToText(selectedEntries);
            await importToHtyq(customName, textContent, false, 'manual');
        }
    }

    return {
        getActiveWorldbooks,
        importWholeWorldbook,
        importToHtyq,
        autoImportActiveWorldbooks,
        manualImportFromST
    };
})();
