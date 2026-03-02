package com.nexus.notification.service;

import com.nexus.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertFatigueService {

    private final NotificationRepository notificationRepository;
    private static final int ALERT_THRESHOLD = 10;

    public boolean isFatigued(String userId) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long count = notificationRepository.countByUserIdAndTimestampAfterAndStatusIn(
                userId,
                oneHourAgo,
                List.of("NOW", "LATER"));
        return count >= ALERT_THRESHOLD;
    }
}
