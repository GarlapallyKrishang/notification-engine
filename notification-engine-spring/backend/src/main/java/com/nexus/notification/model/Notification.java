package com.nexus.notification.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_dedupe_key", columnList = "dedupe_key", unique = true),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_user_time", columnList = "user_id, timestamp")
})
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String source;

    private String priorityHint;

    private String channel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(nullable = false, unique = true)
    private String dedupeKey;

    @Column(nullable = false)
    private String status = "PENDING";

    private boolean aiProcessed = false;

    private Double aiConfidence;

    private String aiModelUsed;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    private LocalDateTime expiresAt;
}
