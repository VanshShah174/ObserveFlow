package dev.observeflow.inventory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@CrossOrigin(origins = "*")
public class InventoryController {

    private static final Logger logger = LoggerFactory.getLogger(InventoryController.class);
    private final Map<String, InventoryItem> inventory = new ConcurrentHashMap<>();

    public InventoryController() {
        // Initialize inventory for all 10 products
        String now = Instant.now().toString();
        inventory.put("1", new InventoryItem("1", 25, 0, "warehouse-east", now));
        inventory.put("2", new InventoryItem("2", 15, 2, "warehouse-east", now));
        inventory.put("3", new InventoryItem("3", 8, 1, "warehouse-west", now));
        inventory.put("4", new InventoryItem("4", 40, 5, "warehouse-east", now));
        inventory.put("5", new InventoryItem("5", 60, 3, "warehouse-central", now));
        inventory.put("6", new InventoryItem("6", 30, 0, "warehouse-central", now));
        inventory.put("7", new InventoryItem("7", 20, 4, "warehouse-west", now));
        inventory.put("8", new InventoryItem("8", 35, 2, "warehouse-east", now));
        inventory.put("9", new InventoryItem("9", 18, 1, "warehouse-west", now));
        inventory.put("10", new InventoryItem("10", 22, 0, "warehouse-central", now));
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "inventory-service", "language", "java");
    }

    @GetMapping("/inventory")
    public Collection<InventoryItem> getAllInventory() {
        logger.info("Fetching all inventory items");
        return inventory.values();
    }

    @GetMapping("/inventory/{productId}")
    public ResponseEntity<?> getInventory(@PathVariable String productId) {
        logger.info("Fetching inventory for product: {}", productId);
        InventoryItem item = inventory.get(productId);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found in inventory"));
        }
        return ResponseEntity.ok(item);
    }

    @PostMapping("/inventory/{productId}/reserve")
    public ResponseEntity<?> reserveStock(@PathVariable String productId, @RequestBody Map<String, Integer> body) {
        int qty = body.getOrDefault("quantity", 1);
        logger.info("Reserving {} units of product: {}", qty, productId);

        InventoryItem item = inventory.get(productId);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found"));
        }

        if (item.getAvailable() < qty) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Insufficient stock", "available", item.getAvailable()));
        }

        item.setReserved(item.getReserved() + qty);
        item.setLastUpdated(Instant.now().toString());
        return ResponseEntity.ok(item);
    }

    @PostMapping("/inventory/{productId}/release")
    public ResponseEntity<?> releaseStock(@PathVariable String productId, @RequestBody Map<String, Integer> body) {
        int qty = body.getOrDefault("quantity", 1);
        logger.info("Releasing {} units of product: {}", qty, productId);

        InventoryItem item = inventory.get(productId);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found"));
        }

        item.setReserved(Math.max(0, item.getReserved() - qty));
        item.setLastUpdated(Instant.now().toString());
        return ResponseEntity.ok(item);
    }

    @PostMapping("/inventory/{productId}/restock")
    public ResponseEntity<?> restock(@PathVariable String productId, @RequestBody Map<String, Integer> body) {
        int qty = body.getOrDefault("quantity", 0);
        logger.info("Restocking {} units of product: {}", qty, productId);

        InventoryItem item = inventory.get(productId);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found"));
        }

        item.setQuantity(item.getQuantity() + qty);
        item.setLastUpdated(Instant.now().toString());
        return ResponseEntity.ok(item);
    }
}
