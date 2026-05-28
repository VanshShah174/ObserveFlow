import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/Orders.jsx";
import { fetchCart } from "./api.js";

function App() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetchCart()
      .then((cart) => setCartCount(cart.items?.length || 0))
      .catch(() => {});
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="app">
      <nav
        style={{
          ...styles.nav,
          ...(scrolled ? styles.navScrolled : {}),
        }}
      >
        <div style={styles.navInner}>
          <Link to="/" style={styles.brandLink}>
            <div style={styles.brandLogo}>
              <span style={styles.brandLogoText}>OF</span>
            </div>
            <div>
              <span style={styles.brandText}>ObserveFlow</span>
              <span style={styles.brandTag}>store</span>
            </div>
          </Link>
          <div style={styles.navLinks}>
            {[
              { path: "/", label: "Home", icon: "🏠" },
              { path: "/products", label: "Products", icon: "📦" },
              { path: "/cart", label: "Cart", icon: "🛒", badge: cartCount },
              { path: "/orders", label: "Orders", icon: "📋" },
            ].map(({ path, label, icon, badge }) => (
              <Link
                key={path}
                to={path}
                style={{
                  ...styles.link,
                  ...(isActive(path) ? styles.linkActive : {}),
                }}
              >
                <span style={styles.linkIcon}>{icon}</span>
                <span>{label}</span>
                {badge > 0 && <span style={styles.badge}>{badge}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <span style={styles.footerLogo}>⚡</span>
            <span style={styles.footerName}>ObserveFlow</span>
          </div>
          <p style={styles.footerText}>
            Distributed Microservices Observability Platform
          </p>
          <div style={styles.footerLinks}>
            <span style={styles.footerLink}>6 Services</span>
            <span style={styles.footerDot}>•</span>
            <span style={styles.footerLink}>4 Languages</span>
            <span style={styles.footerDot}>•</span>
            <span style={styles.footerLink}>OpenTelemetry</span>
            <span style={styles.footerDot}>•</span>
            <span style={styles.footerLink}>ADOT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(26, 26, 46, 0.95)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "all 0.3s ease",
  },
  navScrolled: {
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
  },
  navInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 2.5rem",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    textDecoration: "none",
  },
  brandLogo: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 10px rgba(108, 92, 231, 0.4)",
  },
  brandLogoText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: "0.8rem",
    letterSpacing: "-0.5px",
  },
  brandText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#fff",
    letterSpacing: "-0.5px",
    display: "block",
    lineHeight: "1.2",
  },
  brandTag: {
    fontSize: "0.65rem",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontWeight: "500",
  },
  navLinks: {
    display: "flex",
    gap: "0.25rem",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "rgba(255, 255, 255, 0.6)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
    padding: "0.6rem 1rem",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    position: "relative",
  },
  linkActive: {
    color: "#fff",
    backgroundColor: "rgba(108, 92, 231, 0.3)",
    boxShadow: "inset 0 0 0 1px rgba(108, 92, 231, 0.4)",
  },
  linkIcon: {
    fontSize: "1rem",
  },
  badge: {
    position: "absolute",
    top: "4px",
    right: "4px",
    backgroundColor: "#fd79a8",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: "700",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2.5rem 1.5rem",
    minHeight: "calc(100vh - 180px)",
    animation: "fadeIn 0.4s ease",
  },
  footer: {
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "#fff",
    marginTop: "2rem",
  },
  footerInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
    textAlign: "center",
  },
  footerBrand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  footerLogo: {
    fontSize: "1.2rem",
  },
  footerName: {
    fontWeight: "700",
    color: "#2d3436",
  },
  footerText: {
    color: "#636e72",
    fontSize: "0.85rem",
    marginBottom: "0.75rem",
    maxWidth: "400px",
    margin: "0 auto 0.75rem",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
  },
  footerLink: {
    fontSize: "0.8rem",
    color: "#6c5ce7",
    fontFamily: "monospace",
    fontWeight: "500",
  },
  footerDot: {
    color: "#ddd",
  },
};

export default App;
