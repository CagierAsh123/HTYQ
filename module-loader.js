// 活体引擎 — 模块加载器
// 负责按依赖顺序串行加载所有子模块，并编排启动序列
window.__HTYQ_MODULE_LOADER = (function() {
    function getScriptBaseUrl() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].src;
            if (src && src.includes('main.js')) {
                return src.substring(0, src.lastIndexOf('/'));
            }
        }
        return '.';
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    async function loadEngineModules() {
        if (window.__HTYQ_ENGINE_LOADED__) return;
        const baseUrl = getScriptBaseUrl();
        console.log('模块加载基础路径:', baseUrl);
        const modules = [
            'htyq-state.js',
            'rules/world-engine.js',
            'rules/group-dynamics.js',
            'rules/active-contact.js',
            'rules/revenge.js',
            'rules/blackmarket.js',
            'rules/economy.js',
            'rules/accident.js',
            'rules/reputation.js',
            'rules/power-peak.js',
            'rules/group-relation.js',
            'rules/secret-asset.js',
            'rules/format.js',
            'rules/index.js',
            'htyq-utils.js',
            'ui/htyq-ui-renderer-factory.js',
            'ui/htyq-ui-dashboard.js',
            'ui/htyq-ui-chronicle.js',
            'ui/htyq-ui-events.js',
            'ui/htyq-ui-factions.js',
            'ui/htyq-ui-relations.js',
            'ui/htyq-ui-rumors.js',
            'ui/htyq-ui-economy.js',
            'ui/htyq-ui-blackmarket.js',
            'ui/htyq-ui-reputation.js',
            'ui/htyq-ui-characters.js',
            'ui/htyq-ui-causal.js',
            'ui/htyq-ui-diplomacy.js',
            'ui/htyq-ui-memos.js',
            'ui/settings/htyq-ui-settings-helpers.js',
            'ui/settings/htyq-ui-settings-worldbook-data.js',
            'ui/settings/htyq-ui-settings-worldbook-render.js',
            'ui/settings/htyq-ui-settings-worldbook.js',
            'ui/settings/htyq-ui-settings-events.js',
            'ui/settings/htyq-ui-settings-core.js',
            'ui/htyq-ui-settings.js',
            'ui/htyq-ui-core.js',
            'evolution/htyq-evolution-core.js',
            'evolution/htyq-evolution-strategy.js',
            'evolution/htyq-evolution-prompt.js',
            'evolution/htyq-evolution-api.js',
            'evolution/htyq-evolution-main.js'
        ];
        try {
            for (const mod of modules) {
                await loadScript(`${baseUrl}/${mod}`);
            }
            if (window.HTYQ_STATE) {
                window.HTYQ_STATE.loadGlobalSettings();
                window.HTYQ_STATE.loadWorldState();
                console.log('已加载全局设置与世界状态');
            }
            if (window.HTYQ_UI && window.HTYQ_UI.buildUI) {
                window.HTYQ_UI.buildUI();
                console.log('活体引擎UI已构建');
            } else {
                throw new Error('UI模块未正确加载');
            }
            if (window.HTYQ_EVOLUTION && window.HTYQ_EVOLUTION.start) {
                window.HTYQ_EVOLUTION.start();
                console.log('活体引擎已启动');
            }
            window.__HTYQ_ENGINE_LOADED__ = true;
        } catch (err) {
            console.error('模块加载失败:', err);
            const contentDiv = document.getElementById('htyq-panel-content');
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div style="padding:20px;color:red;">
                        <strong>模块加载失败</strong><br>
                        ${err.message}<br>
                        请检查控制台并刷新页面。
                    </div>
                `;
            }
        }
    }

    return { load: loadEngineModules };
})();
