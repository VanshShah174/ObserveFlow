import { useState, useEffect } from "react";
import { fetchCart, removeFromCart, createOrder } from "../api.js";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const loadCart = () => {
    fetchCart()
      .then(setCart)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (itemId) => {
    setRemovingId(itemId);
    try {
      const updated = await removeFromCart(itemId);
      setCart(updated);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await createOrder();
      navigate("/orders");
    } catch (err) {
      console.error("Failed to checkout:", err);
    } finally {
      setCheckingOut(false);
    }
  };

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Shopping Cart</h1>
          <p style={styles.subtitle}>
            {cart.items.length === 0
              ? "No items yet"
              : `${cart.items.length} ${cart.items.length === 1 ? "item" : "items"} ready for checkout`}
          </p>
        </div>
        {cart.items.length > 0 && (
          <div style={styles.headerTotal}>
            <span style={styles.headerTotalLabel}>Total</span>
            <span style={styles.headerTotalAmount}>${total.toFixed(2)}</span>
          </div>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIconWrapper}>
            <span style={styles.emptyIcon}>🛒</span>
          </div>
          <h3 style={styles.emptyTitle}>Your cart is empty</h3>
          <p style={styles.emptyText}>
            Discover our collection of premium tech products and add your favorites.
          </p>
          <a href="/products" style={styles.shopBtn}>
            Browse Products <span>→</span>
          </a>
        </div>
      ) : (
        <div style={styles.layout}>
          <div style={styles.itemsList}>
            {cart.items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  ...styles.item,
                  opacity: removingId === item.id ? 0.5 : 1,
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <div style={styles.itemLeft}>
                  <div style={styles.itemIcon}>📦</div>
                  <div style={styles.itemInfo}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <p style={styles.itemMeta}>
                      <span style={styles.itemPrice}>${item.price.toFixed(2)}</span>
                      <span style={styles.itemQty}>× {item.quantity}</span>
                    </p>
                  </div>
                </div>
                <div style={styles.itemRight}>
                  <span style={styles.itemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    style={styles.removeBtn}
                    aria-label={`Remove ${item.name} from cart`}
                    disabled={removingId === item.id}
                  >
                    <span style={styles.removeBtnIcon}>×</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <div style={styles.summaryHeader}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
            </div>
            <div style={styles.summaryBody}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal ({cart.items.length} items)</span>
                <span style={styles.summaryValue}>${total.toFixed(2)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Shipping</span>
                <span style={styles.freeShipping}>FREE</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Tax</span>
                <span style={styles.summaryValue}>$0.00</span>
              </div>
              <div style={styles.divider}></div>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalAmount}>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                style={{
                  ...styles.checkoutBtn,
                  opacity: checkingOut ? 0.7 : 1,
                }}
              >
                {checkingOut ? (
                  <span>Processing...</span>
                ) : (
                  <span style={styles.checkoutBtnContent}>
                    <span>Complete Order</span>
                    <span>→</span>
                  </span>
                )}
              </button>
              <p style={styles.secureText}>🔒 Secure checkout</p>
            </div>
          </div>
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
  headerTotal: {
    textAlign: "right",
  },
  headerTotalLabel: {
    display: "block",
    fontSize: "0.8rem",
    color: "#636e72",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "600",
  },
  headerTotalAmount: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#2d3436",
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
    maxWidth: "400px",
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
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "2rem",
    alignItems: "start",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 1.5rem",
    backgroundColor: "#fff",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
    animation: "fadeInUp 0.4s ease both",
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  itemIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    backgroundColor: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
  },
  itemInfo: {},
  itemName: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "0.2rem",
    color: "#2d3436",
  },
  itemMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  itemPrice: {
    color: "#636e72",
    fontSize: "0.85rem",
  },
  itemQty: {
    color: "#636e72",
    fontSize: "0.85rem",
  },
  itemRight: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  itemTotal: {
    fontWeight: "700",
    fontSize: "1.05rem",
    color: "#2d3436",
  },
  removeBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #f0f0f0",
    backgroundColor: "#fff",
    color: "#d63031",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  removeBtnIcon: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    lineHeight: 1,
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
    border: "1px solid #f0f0f0",
    position: "sticky",
    top: "90px",
  },
  summaryHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #f5f5f5",
    backgroundColor: "#fafafa",
  },
  summaryTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#2d3436",
  },
  summaryBody: {
    padding: "1.5rem",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.9rem",
    fontSize: "0.9rem",
  },
  summaryLabel: {
    color: "#636e72",
  },
  summaryValue: {
    color: "#2d3436",
    fontWeight: "500",
  },
  freeShipping: {
    color: "#00b894",
    fontWeight: "700",
    fontSize: "0.8rem",
    backgroundColor: "rgba(0, 184, 148, 0.08)",
    padding: "0.15rem 0.5rem",
    borderRadius: "4px",
  },
  divider: {
    height: "1px",
    backgroundColor: "#f0f0f0",
    margin: "1rem 0 1.25rem",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  totalLabel: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2d3436",
  },
  totalAmount: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#2d3436",
  },
  checkoutBtn: {
    width: "100%",
    padding: "0.9rem",
    background: "linear-gradient(135deg, #00b894, #55efc4)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 15px rgba(0, 184, 148, 0.3)",
    marginBottom: "0.75rem",
  },
  checkoutBtnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  secureText: {
    textAlign: "center",
    fontSize: "0.8rem",
    color: "#636e72",
  },
};

export default Cart;
