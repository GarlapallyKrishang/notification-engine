package com.nexus.notification.controller;

import com.nexus.notification.model.AiHealth;
import com.nexus.notification.model.AuditLog;
import com.nexus.notification.repository.AiHealthRepository;
import com.nexus.notification.repository.AuditLogRepository;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HealthController {

    private final AiHealthRepository aiHealthRepository;
    private final AuditLogRepository auditLogRepository;
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    @Value("${openai.api.key}")
    private String openAiKey;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Optional<AiHealth> healthOpt = aiHealthRepository.findById("singleton");
        int failures = healthOpt.map(AiHealth::getFailureCount).orElse(0);

        String cbState = circuitBreakerRegistry.circuitBreaker("openai").getState().name();
        String aiStatus = (!"mock_key".equals(openAiKey) && "CLOSED".equals(cbState)) ? "healthy" : "degraded";

        Map<String, Object> aiMap = new HashMap<>();
        aiMap.put("status", aiStatus);
        aiMap.put("circuit_state", cbState);
        aiMap.put("failure_count", failures);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy".equals(aiStatus) ? "OK" : "DEGRADED");
        response.put("database", "up");
        response.put("ai_integration", aiMap);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findTop50ByOrderByTimestampDesc());
    }
}
