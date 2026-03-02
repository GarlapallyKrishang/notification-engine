package com.nexus.notification.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_health")
@Data
public class AiHealth {
    @Id
    @Column(name = "id_key", nullable = false)
    private String idKey = "singleton";

    private int failureCount = 0;

    private LocalDateTime lastFailureTime;

    @Column(nullable = false)
    private String circuitState = "CLOSED";
}
