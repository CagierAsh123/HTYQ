// 活体引擎规则模块 — 聚合入口
// 各 DLC 规则已拆分为 rules/ 目录下的独立文件
// 每个文件向 window.__HTYQ_RULE_xxx 写入对应规则字符串
// 本模块读取所有规则并暴露统一接口 window.HTYQ_RULES
window.HTYQ_RULES = (function() {
    const RULES = [
        { key: 'world_engine',    rule: window.__HTYQ_RULE_world_engine },
        { key: 'group_dynamics',  rule: window.__HTYQ_RULE_group_dynamics },
        { key: 'active_contact',  rule: window.__HTYQ_RULE_active_contact },
        { key: 'revenge',         rule: window.__HTYQ_RULE_revenge },
        { key: 'blackmarket',     rule: window.__HTYQ_RULE_blackmarket },
        { key: 'economy',         rule: window.__HTYQ_RULE_economy },
        { key: 'accident',        rule: window.__HTYQ_RULE_accident },
        { key: 'reputation',      rule: window.__HTYQ_RULE_reputation },
        { key: 'power_peak',      rule: window.__HTYQ_RULE_power_peak },
        { key: 'group_relation',  rule: window.__HTYQ_RULE_group_relation },
        { key: 'secret_asset',    rule: window.__HTYQ_RULE_secret_asset },
    ];

    function getFullSystemRules(enabledDlcs) {
        let rules = '';
        for (const entry of RULES) {
            if (enabledDlcs[entry.key] && entry.rule) {
                rules += entry.rule + '\n';
            }
        }
        // FORMAT_RULE 始终包含
        if (window.__HTYQ_RULE_format) {
            rules += window.__HTYQ_RULE_format;
        }
        return rules;
    }

    return {
        getFullSystemRules: getFullSystemRules
    };
})();
