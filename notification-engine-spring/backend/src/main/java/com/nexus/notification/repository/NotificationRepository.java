package com.nexus.notification.repository;

import com.nexus.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    Optional<Notification> findByDedupeKey(String dedupeKey);

    List<Notification> findByUserIdAndTimestampAfter(String userId, LocalDateTime timestamp);

    long countByUserIdAndTimestampAfterAndStatusIn(String userId, LocalDateTime timestamp, List<String> statuses);

    List<Notification> findTop100ByStatusOrderByTimestampAsc(String status);

    List<Notification> findTop50ByStatusOrderByTimestampDesc(String status);

    List<Notification> findTop50ByOrderByTimestampDesc();
}
