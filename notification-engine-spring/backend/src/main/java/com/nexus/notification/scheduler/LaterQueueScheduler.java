package com.nexus.notification.scheduler;

import com.nexus.notification.model.AuditLog;
import com.nexus.notification.model.Notification;
import com.nexus.notification.repository.AuditLogRepository;
import com.nexus.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LaterQueueScheduler {

    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    @Scheduled(fixedRate = 120000) // 2 minutes
    public void processQueue() {
        log.info("[Scheduler] Checking for LATER events...");

        List<Notification> pendingLaters = notificationRepository.findTop100ByStatusOrderByTimestampAsc("LATER");

        if (pendingLaters.isEmpty())
            return;

        log.info("[Scheduler] Processing {} LATER events...", pendingLaters.size());

        for (Notification notif : pendingLaters) {
            // Simulate delivery and state change
            notif.setStatus("NOW"); // Elevated to NOW for delivery
            notificationRepository.save(notif);

            AuditLog audit = new AuditLog();
            audit.setNotificationId(notif.getId());
            audit.setDecision("DELIVERED");
            audit.setReason("Scheduler execution successful");
            auditLogRepository.save(audit);
        }
    }
}
