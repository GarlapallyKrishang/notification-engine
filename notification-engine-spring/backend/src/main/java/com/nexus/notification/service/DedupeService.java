package com.nexus.notification.service;

import com.nexus.notification.model.Notification;
import com.nexus.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DedupeService {

    private final NotificationRepository notificationRepository;

    public boolean isExactDuplicate(String dedupeKey) {
        return notificationRepository.findByDedupeKey(dedupeKey).isPresent();
    }

    public boolean isNearDuplicate(String userId, String message) {
        LocalDateTime fifteenMinsAgo = LocalDateTime.now().minusMinutes(15);
        List<Notification> recentNotifications = notificationRepository.findByUserIdAndTimestampAfter(userId,
                fifteenMinsAgo);

        for (Notification notif : recentNotifications) {
            if (calculateSimilarity(message, notif.getMessage()) > 0.8) {
                return true;
            }
        }
        return false;
    }

    private double calculateSimilarity(String str1, String str2) {
        Set<String> set1 = new HashSet<>(Arrays.asList(str1.toLowerCase().split("\\s+")));
        Set<String> set2 = new HashSet<>(Arrays.asList(str2.toLowerCase().split("\\s+")));

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        if (union.isEmpty())
            return 0.0;
        return (double) intersection.size() / union.size();
    }
}
