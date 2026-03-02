package com.nexus.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.notification.model.AiHealth;
import com.nexus.notification.model.AuditLog;
import com.nexus.notification.model.Notification;
import com.nexus.notification.repository.AiHealthRepository;
import com.nexus.notification.repository.AuditLogRepository;
import com.nexus.notification.repository.NotificationRepository;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenAiService {

    private final NotificationRepository notificationRepository;
    private final RuleEngineService ruleEngineService;
    private final AuditLogRepository auditLogRepository;
    private final AiHealthRepository aiHealthRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplateBuilder().build();
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    @Value("${openai.api.key}")
    private String openAiKey;

    @Async
    public void processAsynchronously(String notificationId, Map<String, Object> payload) {
        Optional<Notification> notifOpt = notificationRepository.findById(notificationId);
        if (notifOpt.isEmpty())
            return;
        Notification notif = notifOpt.get();

        try {
            // Check manual circuit logic or let resilience4j handle it
            // We use resilience4j proxy method to hit the OpenAI API
            // The circuit breaker will automatically throw CallNotPermittedException if
            // OPEN
            processWithAi(notif, payload);
            updateAiHealthState("CLOSED");

        } catch (Exception e) {
            log.error("AI processing failed or Circuit Open. Falling back to rules.", e);
            updateAiHealthState("OPEN");
            fallbackToRules(notif, payload, e.getMessage());
        }
    }

    @CircuitBreaker(name = "openai")
    protected void processWithAi(Notification notif, Map<String, Object> payload) throws Exception {
        if ("mock_key".equals(openAiKey)) {
            throw new RuntimeException("OpenAI API Key not configured");
        }

        String prompt = "Classify this notification into NOW, LATER, or NEVER.\n" +
                "Return ONLY a valid JSON object like: {\"action\": \"NOW\", \"confidence\": 0.95, \"reason\": \"System alert\"}\n"
                +
                "Data:\n" + objectMapper.writeValueAsString(payload);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("temperature", 0.1);
        requestBody.put("response_format", Map.of("type", "json_object"));
        requestBody.put("messages", List.of(Map.of("role", "system", "content", prompt)));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        String responseStr = restTemplate.postForObject("https://api.openai.com/v1/chat/completions", request,
                String.class);

        JsonNode root = objectMapper.readTree(responseStr);
        String content = root.path("choices").get(0).path("message").path("content").asText();
        JsonNode result = objectMapper.readTree(content);

        notif.setStatus(result.path("action").asText());
        notif.setAiProcessed(true);
        notif.setAiConfidence(result.path("confidence").asDouble(1.0));
        notif.setAiModelUsed("gpt-3.5-turbo");
        notificationRepository.save(notif);

        AuditLog audit = new AuditLog();
        audit.setNotificationId(notif.getId());
        audit.setDecision(notif.getStatus());
        audit.setReason(result.path("reason").asText("AI classified"));
        audit.setAiUsed(true);
        audit.setFallbackUsed(false);
        auditLogRepository.save(audit);
    }

    private void fallbackToRules(Notification notif, Map<String, Object> payload, String errorReason) {
        RuleEngineService.EvaluationResult res = ruleEngineService.evaluate(payload);

        notif.setStatus(res.action);
        notif.setAiProcessed(false);
        notificationRepository.save(notif);

        AuditLog audit = new AuditLog();
        audit.setNotificationId(notif.getId());
        audit.setDecision(res.action);
        audit.setReason("Fallback due to: " + errorReason);
        audit.setRuleTriggered(res.ruleName);
        audit.setAiUsed(false);
        audit.setFallbackUsed(true);
        auditLogRepository.save(audit);
    }

    private void updateAiHealthState(String state) {
        AiHealth health = aiHealthRepository.findById("singleton").orElse(new AiHealth());

        // Let's actually sync with Resilience4J instance directly for the DB state
        io.github.resilience4j.circuitbreaker.CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("openai");
        health.setCircuitState(cb.getState().name());

        if ("OPEN".equals(cb.getState().name())) {
            health.setFailureCount(health.getFailureCount() + 1);
            health.setLastFailureTime(LocalDateTime.now());
        } else {
            health.setFailureCount(0);
        }

        aiHealthRepository.save(health);
    }
}
