package com.nexus.notification.repository;

import com.nexus.notification.model.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<Rule, String> {
    List<Rule> findByActiveTrueOrderByPriorityBoostDesc();
}
