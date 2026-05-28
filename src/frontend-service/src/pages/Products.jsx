import { useState, useEffect } from "react";
import { fetchProducts, addToCart } from "../api.js";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={styles.skeleton}>
              <div style={styles.skeletonImage}></div>
              <div style={styles.skeletonBody}>
                <div style={styles.skeletonLine}></div>
                <div style={styles.skeletonLineShort}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Products</h1>
          <p style={styles.subtitle}>
            {products.length} premium tech items available
          </p>
        </div>
        <div style={styles.headerBadge}>
          <span style={styles.headerBadgeDot}></span>
          Live from :4000
        </div>
      </div>

      <div style={styles.grid}>
        {products.map((product, index) => (
          <div
            key={product.id}
            style={{
              ...styles.card,
              animationDelay: `${index * 0.05}s`,
              ...(hoveredId === product.id ? styles.cardHovered : {}),
            }}
            onMouseEnter={() => setHoveredId(product.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={styles.imageWrapper}>
              <img src={product.image} alt={product.name} style={styles.image} />
              <div style={styles.imageOverlay}>
                <span style={styles.priceTag}>${product.price.toFixed(2)}</span>
              </div>
              {product.stock < 10 && (
                <span style={styles.lowStock}>
                  <span style={styles.lowStockDot}></span>
                  Only {product.stock} left
                </span>
              )}
            </div>
            <div style={styles.cardBody}>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.description}>{product.description}</p>
              <div style={styles.cardFooter}>
                <div style={styles.stockInfo}>
                  <div style={styles.stockBar}>
                    <div
                      style={{
                        ...styles.stockFill,
                        width: `${Math.min(product.stock * 2, 100)}%`,
                        backgroundColor: product.stock < 10 ? "#d63031" : "#00b894",
                      }}
                    ></div>
                  </div>
                  <span style={styles.stockText}>{product.stock} in stock</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  style={{
                    ...styles.button,
                    ...(addedId === product.id ? styles.buttonAdded : {}),
                  }}
                >
                  {addedId === product.id ? (
                    <span style={styles.buttonContent}>
                      <span style={styles.checkmark}>✓</span> Added
                    </span>
                  ) : (
                    <span style={styles.buttonContent}>
                      <span>+</span> Add to Cart
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    animation: "fadeInUp 0.5s ease",
  },
  loadingContainer: {
    padding: "2rem 0",
  },
  loadingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  skeleton: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #f0f0f0",
  },
  skeletonImage: {
    height: "220px",
    background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
  skeletonBody: {
    padding: "1.5rem",
  },
  skeletonLine: {
    height: "14px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    marginBottom: "0.75rem",
  },
  skeletonLineShort: {
    height: "14px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    width: "60%",
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
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(0, 184, 148, 0.08)",
    border: "1px solid rgba(0, 184, 148, 0.2)",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#00b894",
    fontFamily: "monospace",
  },
  headerBadgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#00b894",
    animation: "pulse 2s infinite",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "fadeInUp 0.5s ease both",
  },
  cardHovered: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
    borderColor: "rgba(108, 92, 231, 0.2)",
  },
  imageWrapper: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  imageOverlay: {
    position: "absolute",
    bottom: "12px",
    left: "12px",
  },
  priceTag: {
    backgroundColor: "rgba(26, 26, 46, 0.85)",
    backdropFilter: "blur(8px)",
    color: "#fff",
    padding: "0.4rem 0.9rem",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "700",
  },
  lowStock: {
    position: "absolute",
    top: "12px",
    right: "12px",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "rgba(214, 48, 49, 0.9)",
    backdropFilter: "blur(8px)",
    color: "#fff",
    padding: "0.35rem 0.8rem",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  lowStockDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    animation: "pulse 1.5s infinite",
  },
  cardBody: {
    padding: "1.25rem 1.5rem 1.5rem",
  },
  productName: {
    fontSize: "1.1rem",
    fontWeight: "700",
    marginBottom: "0.4rem",
    color: "#2d3436",
  },
  description: {
    fontSize: "0.85rem",
    color: "#636e72",
    marginBottom: "1.25rem",
    lineHeight: "1.6",
  },
  cardFooter: {},
  stockInfo: {
    marginBottom: "1rem",
  },
  stockBar: {
    height: "4px",
    backgroundColor: "#f0f0f0",
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "0.4rem",
  },
  stockFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
  stockText: {
    fontSize: "0.75rem",
    color: "#636e72",
    fontWeight: "500",
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#6c5ce7",
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(108, 92, 231, 0.3)",
  },
  buttonAdded: {
    backgroundColor: "#00b894",
    boxShadow: "0 2px 8px rgba(0, 184, 148, 0.3)",
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
  },
  checkmark: {
    fontSize: "1.1rem",
  },
};

export default Products;
