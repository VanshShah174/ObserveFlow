package dev.observeflow.inventory;

public class InventoryItem {
    private String productId;
    private int quantity;
    private int reserved;
    private String warehouse;
    private String lastUpdated;

    public InventoryItem() {}

    public InventoryItem(String productId, int quantity, int reserved, String warehouse, String lastUpdated) {
        this.productId = productId;
        this.quantity = quantity;
        this.reserved = reserved;
        this.warehouse = warehouse;
        this.lastUpdated = lastUpdated;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getReserved() { return reserved; }
    public void setReserved(int reserved) { this.reserved = reserved; }

    public String getWarehouse() { return warehouse; }
    public void setWarehouse(String warehouse) { this.warehouse = warehouse; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

    public int getAvailable() { return quantity - reserved; }
}
