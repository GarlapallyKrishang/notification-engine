package com.nexus.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.notification.model.Rule;
import com.nexus.notification.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RuleEngineService {

    private final RuleRepository ruleRepository;
    private final ObjectMapper objectMapper;

    public static class EvaluationResult {
        public String action;
        public String ruleName;
        public boolean isFallback;
    }

    public EvaluationResult evaluate(Map<String, Object> data) {
        EvaluationResult res = new EvaluationResult();
        res.isFallback = true;

        try {
            List<Rule> activeRules = ruleRepository.findByActiveTrueOrderByPriorityBoostDesc();
            JsonNode dataNode = objectMapper.valueToTree(data);

            for (Rule rule : activeRules) {
                JsonNode condition = objectMapper.readTree(rule.getConditionJson());
                if (matchesCondition(dataNode, condition)) {
                    res.action = rule.getAction();
                    res.ruleName = rule.getName();
                    return res;
                }
            }

        } catch (Exception e) {
            log.error("Rule engine error", e);
        }

        res.action = "LATER";
        res.ruleName = "default_fallback";
        return res;
    }

    private boolean matchesCondition(JsonNode data, JsonNode condition) {
        if (condition == null || !condition.isObject())
            return false;

        if (condition.has("and") && condition.get("and").isArray()) {
            for (JsonNode child : condition.get("and")) {
                if (!matchesCondition(data, child))
                    return false;
            }
            return true;
        }

        if (!condition.has("field") || !condition.has("operator"))
            return false;

        String field = condition.get("field").asText();
        String operator = condition.get("operator").asText();
        JsonNode valueNode = condition.get("value");

        JsonNode actualValue = data.get(field);
        if (actualValue == null || actualValue.isNull())
            return false;

        switch (operator) {
            case "eq":
                return actualValue.asText().equals(valueNode.asText());
            case "neq":
                return !actualValue.asText().equals(valueNode.asText());
            case "includes":
                return actualValue.asText().contains(valueNode.asText());
            default:
                return false;
        }
    }
}
