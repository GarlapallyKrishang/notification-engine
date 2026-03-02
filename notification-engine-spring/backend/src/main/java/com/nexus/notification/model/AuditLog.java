package com.nexus.notification.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = { @Index(name = "idx_audit_time", columnList = "timestamp DESC") })
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String notificationId;

    @Column(nullable = false)
    private String decision;

    @Column(nullable = false, length = 1000)
    private String reason;

    private String ruleTriggered;

    private boolean aiUsed = false;

    private boolean fallbackUsed = false;

    private LocalDateTime timestamp = LocalDateTime.now();
}
