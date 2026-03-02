package com.nexus.notification.controller;

import com.nexus.notification.model.Rule;
import com.nexus.notification.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RuleController {

    private final RuleRepository ruleRepository;

    @GetMapping
    public ResponseEntity<List<Rule>> getRules() {
        return ResponseEntity.ok(ruleRepository.findByActiveTrueOrderByPriorityBoostDesc());
    }

    @PostMapping
    public ResponseEntity<Rule> createRule(@RequestBody Rule rule) {
        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rule> updateRule(@PathVariable String id, @RequestBody Rule ruleUpdates) {
        Optional<Rule> existingOpt = ruleRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Rule existing = existingOpt.get();
        existing.setName(ruleUpdates.getName());
        existing.setConditionJson(ruleUpdates.getConditionJson());
        existing.setAction(ruleUpdates.getAction());
        existing.setPriorityBoost(ruleUpdates.getPriorityBoost());
        existing.setActive(ruleUpdates.isActive());

        return ResponseEntity.ok(ruleRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable String id) {
        ruleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
