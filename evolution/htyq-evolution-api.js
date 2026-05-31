// API 调用和重试逻辑
window.HTYQ_EVOLUTION_API = (function() {
    const STATE = window.HTYQ_STATE;
    const utils = window.HTYQ_UTILS;
    const promptBuilder = window.HTYQ_EVOLUTION_PROMPT;
    const core = window.HTYQ_EVOLUTION_CORE;

    function getCustomApiUrl(base) {
        let u = base.trim().replace(/\/+$/, '');
        if (!u) return '';
        return u.endsWith('/chat/completions') ? u : (u.endsWith('/v1') ? u + '/chat/completions' : u + '/v1/chat/completions');
    }

    let currentRetry = 0;
    let floatingToast = null;

    // 修复：使用固定 ID 确保能正确移除
    function showPersistentToast(text, isError = false, duration = null) {
        // 先移除已存在的 toast
        const existing = document.getElementById('htyq-persistent-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.id = 'htyq-persistent-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isError ? '#dc2626' : '#1f2937'};
            color: white;
            padding: 10px 18px;
            border-radius: 8px;
            z-index: 10004;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
            pointer-events: auto;
            cursor: pointer;
            max-width: 350px;
            text-align: center;
        `;
        toast.innerHTML = text + '<br><small style="font-size:10px;">点击关闭</small>';
        toast.onclick = () => toast.remove();
        document.body.appendChild(toast);
        floatingToast = toast;
        if (duration) {
            setTimeout(() => {
                if (toast && toast.parentNode) toast.remove();
                if (floatingToast === toast) floatingToast = null;
            }, duration);
        }
    }

    function hidePersistentToast() {
        const toast = document.getElementById('htyq-persistent-toast');
        if (toast && toast.parentNode) toast.remove();
        floatingToast = null;
    }

    // 新增：原始 API 调用，不经过重试，返回解析后的 JSON 对象
    async function callRawAPI(prompt, logTag = '') {
        try {
            console.log(`${logTag} Prompt 长度:`, prompt.length);
            let rawResult;
            const settings = STATE.globalApiSettings;
            if (settings.apiMode === 'custom' && settings.customUrl) {
                const response = await fetch(getCustomApiUrl(settings.customUrl), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.customKey}` },
                    body: JSON.stringify({
                        model: settings.customModel || 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: '你是活体世界引擎，只返回纯净JSON，不要包含任何额外解释。' },
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.8
                    })
                });
                if (!response.ok) throw new Error(`API HTTP ${response.status}`);
                const data = await response.json();
                rawResult = data.choices[0].message.content;
            } else {
                const ctx = (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) ? SillyTavern.getContext() : getContext();
                if (!ctx.generateRaw) throw new Error('当前环境不支持 generateRaw');
                rawResult = await ctx.generateRaw({ prompt, max_tokens: 4000, temperature: 0.8, should_stream: false });
                if (typeof rawResult !== 'string') rawResult = rawResult.text || String(rawResult);
            }
            console.log(`${logTag} 原始返回:`, rawResult);
            let jsonStr = rawResult.trim().replace(/```json/g, '').replace(/```/g, '');
            const firstBrace = jsonStr.indexOf('{');
            const lastBrace = jsonStr.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1) throw new Error('返回内容不包含有效的JSON对象');
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            const evolutionData = JSON.parse(jsonStr);
            return evolutionData;
        } catch (err) {
            console.error(`${logTag} 调用失败:`, err);
            return null;
        }
    }

    async function attemptEvolution(manual) {
        const maxRetries = 3;
        try {
            const prompt = await promptBuilder.buildEvolutionPrompt();
            console.log('推演 Prompt 长度:', prompt.length);
            const evolutionData = await callRawAPI(prompt, '推演');
            if (!evolutionData) throw new Error('API 返回无效数据');
            console.log('解析后的数据:', evolutionData);
            const success = core.applyEvolution(evolutionData);
            if (!success) throw new Error('应用数据失败');
            STATE.worldState.round++;
            STATE.saveWorldState();
            if (window.HTYQ_UI && window.HTYQ_UI.refresh) window.HTYQ_UI.refresh();
            const settings = STATE.globalApiSettings;
            if (settings.autoInject) injectWorldSummaryToChat();
            if (evolutionData.active_contact) {
                utils.showFloatingWarning(`⚠️ 主动接触: ${evolutionData.active_contact.summary}`, true);
                STATE.worldState.activeContactBanner = {
                    summary: evolutionData.active_contact.summary,
                    details: evolutionData.active_contact.details,
                    timestamp: Date.now()
                };
                STATE.saveWorldState();
                await utils.insertActiveContactMessage(evolutionData.active_contact.details);
            }
            currentRetry = 0;
            hidePersistentToast();
            utils.showFloatingWarning('世界推演完成', false);
            return;
        } catch (err) {
            console.error('推演错误:', err);
            if (currentRetry >= maxRetries) throw err;
            currentRetry++;
            const retryMsg = `🌍 推演失败 (${err.message})，第${currentRetry}/${maxRetries}次重试...`;
            showPersistentToast(retryMsg, true, 3000);
            await new Promise(r => setTimeout(r, 2000));
            return attemptEvolution(manual);
        }
    }

    function injectWorldSummaryToChat() {
        const s = STATE.worldState;
        const rep = s.reputation;
        const repStr = `江湖:${rep.jianghu} 官府:${rep.official} 民间:${rep.folk} 黑道:${rep.underworld}`;
        const pending = s.pendingEvents.length ? s.pendingEvents.join('；') : '无';
        const injectContent = `【世界时间】${s.worldTime || '未知'}
【世界大势】${s.worldDigest}
【氛围】${s.overallAtmosphere || '无'} | 治安：${s.securityStatus || '无'} | 星象：${s.astrology || '无'}
【待爆发事件】${pending}
【声誉】${repStr}`;

        try {
            const ctx = (typeof SillyTavern !== 'undefined' && SillyTavern.getContext)
                ? SillyTavern.getContext()
                : (typeof getContext === 'function' ? getContext() : null);
            if (!ctx || !ctx.extensionPrompts) return;

            // 直接写 extension_prompts 对象 — ST 的 prompt 组装器从这里读取
            // position: 1 = IN_CHAT（注入到聊天消息中），按 depth=0 插入最新消息附近
            // 内存级、session 级，不落盘，切换聊天自然隔离
            ctx.extensionPrompts['htyq_inject'] = {
                value: injectContent,
                position: 1,
                depth: 0,
                scan: true,
                role: 0
            };
        } catch(e) {}
    }

    return { attemptEvolution, injectWorldSummaryToChat, showPersistentToast, hidePersistentToast, callRawAPI };
})();
