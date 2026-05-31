// 世界书列表渲染模块（从 worldbook 拆出）
window.__HTYQ_UI_SETTINGS_WORLDBOOK_RENDER = (function() {
    const STATE = window.HTYQ_STATE;
    const utils = window.HTYQ_UTILS;
    const escapeHtml = utils.escapeHtml;

    function renderWorldList(container, worldState, onRefresh) {
        const worlds = worldState.manualWorlds || [];
        const selectedIndices = new Set();

        function refreshList() {
            if (!container) return;
            if (!worlds.length) {
                container.innerHTML = '<div style="color:#64748b; padding:12px; text-align:center;">暂无世界书，请从ST世界书导入</div>';
                return;
            }
            container.innerHTML = `
                <div style="margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                        <input type="checkbox" id="htyq-select-all-cb" ${selectedIndices.size === worlds.length ? 'checked' : ''}>
                        <span style="font-size:12px;">全选</span>
                    </label>
                    <button id="htyq-batch-delete-btn" class="htyq-small-btn" style="background:#ef4444; padding:4px 10px;">🗑️ 删除选中</button>
                </div>
                <div id="htyq-worlds-container">
                    ${worlds.map((world, idx) => `
                        <div style="border:1px solid #334155; border-radius:8px; margin-bottom:12px; padding:12px; background:#1e2937;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <input type="checkbox" class="htyq-world-select" data-index="${idx}" ${selectedIndices.has(idx) ? 'checked' : ''}>
                                    <label style="display:flex; align-items:center; gap:8px;">
                                        <input type="checkbox" class="htyq-world-enable" data-index="${idx}" ${world.enabled !== false ? 'checked' : ''}>
                                        <strong>${escapeHtml(world.name)}</strong>
                                    </label>
                                </div>
                                <div>
                                    <button class="htyq-test-world-btn" data-index="${idx}" style="background:#8b5cf6; border:none; color:white; border-radius:4px; padding:4px 10px; margin-right:6px; cursor:pointer;">🔍 测试</button>
                                    <button class="htyq-edit-world-btn" data-index="${idx}" style="background:#f59e0b; border:none; color:white; border-radius:4px; padding:4px 10px; margin-right:6px; cursor:pointer;">✏️ 修改</button>
                                    <button class="htyq-del-world-btn" data-index="${idx}" style="background:#ef4444; border:none; color:white; border-radius:4px; padding:4px 10px; cursor:pointer;">删除</button>
                                </div>
                            </div>
                            <div style="font-size:12px; color:#94a3b8; margin-top:6px;">📄 内容长度：${world.content.length} 字符</div>
                        </div>
                    `).join('')}
                </div>
            `;

            bindListEvents(container, worlds, selectedIndices, refreshList);
        }

        refreshList();
        return { refreshList };
    }

    function bindListEvents(container, worlds, selectedIndices, refreshList) {
        const selectAllCb = container.querySelector('#htyq-select-all-cb');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', (e) => {
                const selectCbs = container.querySelectorAll('.htyq-world-select');
                if (e.target.checked) {
                    for (let i = 0; i < worlds.length; i++) selectedIndices.add(i);
                    selectCbs.forEach(cb => cb.checked = true);
                } else {
                    selectedIndices.clear();
                    selectCbs.forEach(cb => cb.checked = false);
                }
            });
        }

        container.querySelectorAll('.htyq-world-select').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = parseInt(cb.dataset.index);
                if (e.target.checked) selectedIndices.add(idx);
                else selectedIndices.delete(idx);
                const allCb = container.querySelector('#htyq-select-all-cb');
                if (allCb) allCb.checked = (selectedIndices.size === worlds.length);
            });
        });

        const batchDeleteBtn = container.querySelector('#htyq-batch-delete-btn');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', () => {
                if (selectedIndices.size === 0) {
                    utils.showFloatingWarning('没有选中任何世界书', true);
                    return;
                }
                const names = Array.from(selectedIndices).map(i => worlds[i]?.name).filter(Boolean);
                if (!confirm(`确定删除选中的 ${selectedIndices.size} 个世界书吗？\n${names.join(', ')}`)) return;
                const sortedIndices = Array.from(selectedIndices).sort((a,b) => b - a);
                for (const idx of sortedIndices) worlds.splice(idx, 1);
                selectedIndices.clear();
                STATE.saveWorldState();
                refreshList();
                utils.showFloatingWarning(`已删除 ${sortedIndices.length} 个世界书`, false);
                const previewArea = document.querySelector('#htyq-world-preview');
                if (previewArea) previewArea.innerHTML = '<div style="color:#94a3b8; text-align:center; font-size:12px;">点击「测试」按钮，此处将显示世界书完整内容</div>';
            });
        }

        container.querySelectorAll('.htyq-world-enable').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = parseInt(cb.dataset.index);
                if (!isNaN(idx)) {
                    worlds[idx].enabled = cb.checked;
                    STATE.saveWorldState();
                    utils.showFloatingWarning(`已${cb.checked ? '启用' : '禁用'}「${worlds[idx].name}」`, false);
                }
            });
        });

        container.querySelectorAll('.htyq-test-world-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                const world = worlds[idx];
                if (world) {
                    const previewArea = document.querySelector('#htyq-world-preview');
                    if (previewArea) {
                        previewArea.innerHTML = `
                            <div style="background:#0f172a; padding:12px; border-radius:8px; border-left:4px solid #8b5cf6;">
                                <div style="font-weight:bold; color:#c084fc; margin-bottom:8px;">📖 ${escapeHtml(world.name)} 完整内容</div>
                                <pre style="white-space:pre-wrap; font-family:monospace; font-size:12px; color:#e2e8f0; margin:0; max-height:400px; overflow-y:auto;">${escapeHtml(world.content)}</pre>
                            </div>
                        `;
                    } else {
                        alert(`内容长度：${world.content.length} 字符\n\n${world.content.substring(0, 2000)}${world.content.length > 2000 ? '\n…(内容过长，已截断)' : ''}`);
                    }
                }
            });
        });

        container.querySelectorAll('.htyq-edit-world-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                const world = worlds[idx];
                if (!world) return;
                showEditDialog(world, refreshList);
            });
        });

        container.querySelectorAll('.htyq-del-world-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                if (!isNaN(idx) && confirm('确定删除这个世界书吗？')) {
                    const name = worlds[idx].name;
                    worlds.splice(idx, 1);
                    const newSelected = new Set();
                    for (let i of selectedIndices) {
                        if (i < idx) newSelected.add(i);
                        else if (i > idx) newSelected.add(i-1);
                    }
                    selectedIndices.clear();
                    for (let i of newSelected) selectedIndices.add(i);
                    STATE.saveWorldState();
                    refreshList();
                    utils.showFloatingWarning(`已删除「${name}」`, false);
                    const previewArea = document.querySelector('#htyq-world-preview');
                    if (previewArea) previewArea.innerHTML = '';
                }
            });
        });
    }

    function showEditDialog(world, onSaved) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10007; display:flex; align-items:center; justify-content:center;';
        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#1e2937; border-radius:12px; padding:20px; width:600px; max-width:90%; max-height:90%; border:1px solid #334155; display:flex; flex-direction:column;';
        dialog.innerHTML = `
            <h3 style="margin:0 0 12px 0; font-size:16px; color:#f59e0b;">✏️ 修改世界书</h3>
            <div style="margin-bottom:8px;">
                <label style="font-size:12px; color:#94a3b8;">名称</label>
                <input type="text" id="htyq-edit-name" value="${escapeHtml(world.name)}" style="width:100%; background:#0f172a; color:#e2e8f0; border:1px solid #334155; border-radius:6px; padding:8px; box-sizing:border-box;">
            </div>
            <div style="margin-bottom:12px; flex:1; display:flex; flex-direction:column;">
                <label style="font-size:12px; color:#94a3b8;">内容</label>
                <textarea id="htyq-edit-content" style="width:100%; flex:1; min-height:300px; background:#0f172a; color:#e2e8f0; border:1px solid #334155; border-radius:6px; padding:8px; font-family:monospace; font-size:12px; resize:vertical; box-sizing:border-box;">${escapeHtml(world.content)}</textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button id="htyq-edit-cancel-btn" style="background:#334155; border:none; color:#e2e8f0; padding:8px 16px; border-radius:6px; cursor:pointer;">取消</button>
                <button id="htyq-edit-save-btn" style="background:#f59e0b; border:none; color:white; padding:8px 16px; border-radius:6px; cursor:pointer;">保存</button>
            </div>
        `;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const nameInput = dialog.querySelector('#htyq-edit-name');
        const contentInput = dialog.querySelector('#htyq-edit-content');
        const close = () => overlay.remove();

        dialog.querySelector('#htyq-edit-cancel-btn').onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
        dialog.querySelector('#htyq-edit-save-btn').onclick = () => {
            const newName = nameInput.value.trim();
            if (!newName) { utils.showFloatingWarning('名称不能为空', true); return; }
            world.name = newName;
            world.content = contentInput.value;
            STATE.saveWorldState();
            close();
            onSaved();
            utils.showFloatingWarning(`已保存「${newName}」`, false);
        };
    }

    return { renderWorldList };
})();
