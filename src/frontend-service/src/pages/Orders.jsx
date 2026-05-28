import { useState, useEffect } from "react";
import { fetchOrders } from "../api.js";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading order history...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Order History</h1>
          <p style={styles.subtitle}>
            {orders.length === 0
              ? "No orders placed yet"
              : `${orders.length} ${orders.length === 1 ? "order" : "orders"} placed`}
          </p>
        </div>
        {orders.length > 0 && (
          <div style={styles.headerBadge}>
            <span style={styles.headerBadgeIcon}>📋</span>
            {orders.length} total
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIconWrapper}>
            <span style={styles.emptyIcon}>📋</span>
          </div>
          <h3 style={styles.emptyTitle}>No orders yet</h3>
          <p style={styles.emptyText}>
            Once you checkout items from your cart, your order history will appear here.
          </p>
          <a href="/products" style={styles.shopBtn}>
            Start Shopping <span>→</span>
          </a>
        </div>
      ) : (
        <div style={styles.orders}>
          {orders.map((order, index) => (
            <div
              key={order.id}
              style={{
                ...styles.order,
                animationDelay: `${index * 0.08}s`,
              }}
            >
              <div style={styles.orderHeader}>
                <div style={styles.orderHeaderLeft}>
                  <div style={styles.orderIconWrapper}>
                    <span style={styles.orderIcon}>✓</span>
                  </div>
                  <div>
                    <span style={styles.orderId}>#{order.id.slice(-8)}</span>
                    <span style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div style={styles.orderHeaderRight}>
                  <span style={styles.status}>
                    <span style={styles.statusDot}></span>
                    {order.status}
                  </span>
                </div>
              </div>

              <div style={styles.orderItems}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={styles.orderItem}>
                    <div style={styles.orderItemLeft}>
                      <div style={styles.orderItemBullet}></div>
                      <span style={styles.orderItemName}>{item.name}</span>
                      <span style={styles.orderItemQty}>×{item.quantity}</span>
                    </div>
                    <span style={styles.orderItemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={styles.orderFooter}>
                <div style={styles.orderFooterLeft}>
                  <span style={styles.itemCount}>
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <div style={styles.orderTotal}>
                  <span style={styles.totalLabel}>Total</span>
                  <span style={styles.totalAmount}>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    animation: "fadeInUp 0.5s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "6rem 2rem",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f0f0f0",
    borderTop: "3px solid #6c5ce7",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    marginTop: "1rem",
    color: "#636e72",
    fontSize: "0.9rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "800",
    color: "#2d3436",
    marginBottom: "0.3rem",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#636e72",
    fontSize: "0.95rem",
  },
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(108, 92, 231, 0.08)",
    border: "1px solid rgba(108, 92, 231, 0.15)",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#6c5ce7",
  },
  headerBadgeIcon: {
    fontSize: "0.9rem",
  },
  empty: {
    textAlign: "center",
    padding: "5rem 2rem",
    backgroundColor: "#fff",
    borderRadius: "20px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f0f0f0",
  },
  emptyIconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
  },
  emptyIcon: {
    fontSize: "2.5rem",
  },
  emptyTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
    color: "#2d3436",
  },
  emptyText: {
    color: "#636e72",
    marginBottom: "2rem",
    maxWidth: "420px",
    margin: "0 auto 2rem",
    lineHeight: "1.6",
  },
  shopBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.8rem 2rem",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    color: "#fff",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "0.95rem",
    boxShadow: "0 4px 15px rgba(108, 92, 231, 0.3)",
  },
  orders: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  order: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
    animation: "fadeInUp 0.5s ease both",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #f8f8f8",
  },
  orderHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  orderIconWrapper: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #00b894, #55efc4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0, 184, 148, 0.3)",
  },
  orderIcon: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  orderId: {
    display: "block",
    fontWeight: "700",
    fontSize: "0.95rem",
    fontFamily: "monospace",
    color: "#2d3436",
  },
  orderDate: {
    display: "block",
    color: "#636e72",
    fontSize: "0.8rem",
    marginTop: "0.1rem",
  },
  orderHeaderRight: {},
  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "rgba(0, 184, 148, 0.08)",
    color: "#00b894",
    padding: "0.35rem 0.9rem",
    borderRadius: "20px",
    fontSize: "0.78rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#00b894",
  },
  orderItems: {
    padding: "1rem 1.5rem",
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.6rem 0",
  },
  orderItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  orderItemBullet: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#ddd",
  },
  orderItemName: {
    fontWeight: "500",
    color: "#2d3436",
    fontSize: "0.9rem",
  },
  orderItemQty: {
    color: "#636e72",
    fontSize: "0.8rem",
    backgroundColor: "#f5f5f5",
    padding: "0.1rem 0.4rem",
    borderRadius: "4px",
  },
  orderItemPrice: {
    fontWeight: "600",
    color: "#2d3436",
    fontSize: "0.9rem",
  },
  orderFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    backgroundColor: "#fafafa",
    borderTop: "1px solid #f0f0f0",
  },
  orderFooterLeft: {},
  itemCount: {
    fontSize: "0.8rem",
    color: "#636e72",
    fontWeight: "500",
  },
  orderTotal: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  totalLabel: {
    fontSize: "0.85rem",
    color: "#636e72",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#2d3436",
  },
};

export default Orders;
