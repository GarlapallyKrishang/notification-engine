package com.nexus.notification.repository;

import com.nexus.notification.model.AiHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiHealthRepository extends JpaRepository<AiHealth, String> {
}
