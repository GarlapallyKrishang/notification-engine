package com.nexus.notification.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.notification.model.Notification;
import com.nexus.notification.repository.NotificationRepository;
import com.nexus.notification.service.AlertFatigueService;
import com.nexus.notification.service.DedupeService;
import com.nexus.notification.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow frontend
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final DedupeService dedupeService;
    private final AlertFatigueService alertFatigueService;
    private final OpenAiService openAiService;
    private final ObjectMapper objectMapper;

    @PostMapping("/events")
    public ResponseEntity<?> receiveEvent(@RequestBody Map<String, Object> payload)
            throws NoSuchAlgorithmException, JsonProcessingException {
        if (!payload.containsKey("user_id") || !payload.containsKey("event_type") || !payload.containsKey("message")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }

        String userId = (String) payload.get("user_id");
        String eventType = (String) payload.get("event_type");
        String message = (String) payload.get("message");

        String dedupeKey = (String) payload.get("dedupe_key");
        if (dedupeKey == null) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((userId + "-" + eventType + "-" + message).getBytes(StandardCharsets.UTF_8));
            dedupeKey = HexFormat.of().formatHex(hash);
        }

        if (dedupeService.isExactDuplicate(dedupeKey)) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("message", "Accepted (Exact Duplicate)"));
        }

        if (dedupeService.isNearDuplicate(userId, message)) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("message", "Accepted (Near Duplicate)"));
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setEventType(eventType);
        notification.setMessage(message);
        notification.setSource((String) payload.getOrDefault("source", "api"));
        notification.setPriorityHint((String) payload.get("priority_hint"));
        notification.setChannel((String) payload.get("channel"));
        notification.setDedupeKey(dedupeKey);

        if (payload.containsKey("metadata")) {
            notification.setMetadata(objectMapper.writeValueAsString(payload.get("metadata")));
        }

        if (alertFatigueService.isFatigued(userId)) {
            notification.setStatus("NEVER");
            notification.setPriorityHint("Fatigue Triggered");
        }

        notification = notificationRepository.save(notification);

        if ("PENDING".equals(notification.getStatus())) {
            // Fire and forget Async
            openAiService.processAsynchronously(notification.getId(), payload);
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "Accepted", "id", notification.getId()));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> listNotifications(@RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(notificationRepository.findTop50ByStatusOrderByTimestampDesc(status));
        }
        return ResponseEntity.ok(notificationRepository.findTop50ByOrderByTimestampDesc());
    }
}
