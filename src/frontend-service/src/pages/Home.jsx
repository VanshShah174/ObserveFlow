import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.badgeDot}></span>
            Live Microservices Demo v2
          </div>
          <h1 style={styles.title}>
            Shop. Observe.<br />
            <span style={styles.titleGradient}>Understand.</span>
          </h1>
          <p style={styles.subtitle}>
            Experience a fully distributed e-commerce platform instrumented with
            OpenTelemetry. Every click generates traces, metrics, and logs across
            6 polyglot microservices.
          </p>
          <div style={styles.heroActions}>
            <Link to="/products" style={styles.primaryBtn}>
              <span>Explore Products</span>
              <span style={styles.btnArrow}>→</span>
            </Link>
            <Link to="/orders" style={styles.secondaryBtn}>
              View Orders
            </Link>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.stat}>
              <span style={styles.statNumber}>6</span>
              <span style={styles.statLabel}>Services</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>4</span>
              <span style={styles.statLabel}>Languages</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>∞</span>
              <span style={styles.statLabel}>Traces</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div style={styles.heroDecor1}></div>
        <div style={styles.heroDecor2}></div>
        <div style={styles.heroDecor3}></div>
      </div>

      {/* Services Section */}
      <div style={styles.features}>
        <div style={styles.featuresHeader}>
          <span style={styles.featuresTag}>POLYGLOT SERVICES</span>
          <h2 style={styles.featuresTitle}>Built with Multiple Languages</h2>
          <p style={styles.featuresSubtitle}>
            Each service is independently deployable, observable, and written in the best language for the job.
          </p>
        </div>

        <div style={styles.cards}>
          {[
            {
              icon: "📦",
              title: "Product Catalog",
              desc: "Browse curated tech products. Fast REST API with structured JSON logging.",
              color: "#6c5ce7",
              gradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
              link: "/products",
              linkText: "Browse Products",
              port: "4000",
              lang: "Node.js",
            },
            {
              icon: "🛒",
              title: "Smart Cart",
              desc: "Add, remove, and manage items with real-time updates across services.",
              color: "#00cec9",
              gradient: "linear-gradient(135deg, #00cec9, #81ecec)",
              link: "/cart",
              linkText: "View Cart",
              port: "4001",
              lang: "Node.js",
            },
            {
              icon: "📋",
              title: "Order Processing",
              desc: "Checkout orchestrates cart and notification services. Full distributed tracing.",
              color: "#fd79a8",
              gradient: "linear-gradient(135deg, #fd79a8, #fab1a0)",
              link: "/orders",
              linkText: "View Orders",
              port: "4002",
              lang: "Node.js",
            },
            {
              icon: "👤",
              title: "User Profiles",
              desc: "User management with profiles, tiers, and membership tracking.",
              color: "#e17055",
              gradient: "linear-gradient(135deg, #e17055, #fab1a0)",
              link: "/products",
              linkText: "Explore",
              port: "4003",
              lang: "Python",
            },
            {
              icon: "🔔",
              title: "Notifications",
              desc: "High-performance event-driven notifications on order and system events.",
              color: "#00b894",
              gradient: "linear-gradient(135deg, #00b894, #55efc4)",
              link: "/orders",
              linkText: "Explore",
              port: "4004",
              lang: "Go",
            },
            {
              icon: "📊",
              title: "Inventory Management",
              desc: "Stock tracking, reservations, and warehouse management with enterprise patterns.",
              color: "#0984e3",
              gradient: "linear-gradient(135deg, #0984e3, #74b9ff)",
              link: "/products",
              linkText: "Explore",
              port: "4005",
              lang: "Java",
            },
          ].map((card) => (
            <div key={card.title} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={{ ...styles.cardIconBg, background: card.gradient }}>
                  <span style={styles.cardIcon}>{card.icon}</span>
                </div>
                <div style={styles.cardMeta}>
                  <span style={styles.cardPort}>:{card.port}</span>
                  <span style={{ ...styles.cardLang, borderColor: `${card.color}40`, color: card.color }}>
                    {card.lang}
                  </span>
                </div>
              </div>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDesc}>{card.desc}</p>
              <Link to={card.link} style={{ ...styles.cardLink, color: card.color }}>
                {card.linkText}
                <span style={styles.cardLinkArrow}>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.cta}>
        <div style={styles.ctaContent}>
          <h3 style={styles.ctaTitle}>Ready to explore?</h3>
          <p style={styles.ctaText}>
            Add products to your cart, place orders, and watch telemetry flow across all 6 services.
          </p>
          <Link to="/products" style={styles.ctaBtn}>
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    animation: "fadeInUp 0.5s ease",
  },
  hero: {
    position: "relative",
    padding: "5rem 3rem",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    borderRadius: "24px",
    overflow: "hidden",
    marginBottom: "4rem",
    boxShadow: "0 20px 60px rgba(26, 26, 46, 0.4)",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse at 30% 50%, rgba(108, 92, 231, 0.15) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1.2rem",
    backgroundColor: "rgba(108, 92, 231, 0.2)",
    border: "1px solid rgba(108, 92, 231, 0.3)",
    borderRadius: "24px",
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#a29bfe",
    marginBottom: "2rem",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#00b894",
    boxShadow: "0 0 8px rgba(0, 184, 148, 0.6)",
    animation: "pulse 2s infinite",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: "900",
    color: "#fff",
    lineHeight: "1.15",
    marginBottom: "1.5rem",
    letterSpacing: "-1.5px",
  },
  titleGradient: {
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe, #00cec9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundSize: "200% 200%",
    animation: "gradientShift 4s ease infinite",
  },
  subtitle: {
    fontSize: "1.15rem",
    color: "rgba(255, 255, 255, 0.7)",
    maxWidth: "550px",
    lineHeight: "1.8",
    marginBottom: "2.5rem",
  },
  heroActions: {
    display: "flex",
    gap: "1rem",
    marginBottom: "3rem",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.9rem 2rem",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    color: "#fff",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "1rem",
    boxShadow: "0 4px 20px rgba(108, 92, 231, 0.4)",
    transition: "all 0.3s ease",
  },
  btnArrow: {
    transition: "transform 0.2s",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.9rem 2rem",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#fff",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },
  heroStats: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
  },
  statNumber: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#fff",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "500",
  },
  statDivider: {
    width: "1px",
    height: "40px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  heroDecor1: {
    position: "absolute",
    top: "-50px",
    right: "-50px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108, 92, 231, 0.2) 0%, transparent 70%)",
    animation: "float 6s ease-in-out infinite",
  },
  heroDecor2: {
    position: "absolute",
    bottom: "-30px",
    right: "20%",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0, 206, 201, 0.15) 0%, transparent 70%)",
    animation: "float 8s ease-in-out infinite",
  },
  heroDecor3: {
    position: "absolute",
    top: "20%",
    right: "10%",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(253, 121, 168, 0.1) 0%, transparent 70%)",
    animation: "float 5s ease-in-out infinite",
  },
  features: {
    marginBottom: "3rem",
  },
  featuresHeader: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  featuresTag: {
    display: "inline-block",
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#6c5ce7",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "0.75rem",
    padding: "0.3rem 1rem",
    backgroundColor: "rgba(108, 92, 231, 0.08)",
    borderRadius: "20px",
  },
  featuresTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#2d3436",
    marginBottom: "0.5rem",
    letterSpacing: "-0.5px",
  },
  featuresSubtitle: {
    color: "#636e72",
    fontSize: "1rem",
    maxWidth: "500px",
    margin: "0 auto",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    position: "relative",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
    overflow: "hidden",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.25rem",
  },
  cardIconBg: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  cardIcon: {
    fontSize: "1.4rem",
    filter: "brightness(0) invert(1)",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  cardPort: {
    fontSize: "0.72rem",
    fontFamily: "monospace",
    color: "#636e72",
    backgroundColor: "#f5f5f5",
    padding: "0.2rem 0.5rem",
    borderRadius: "5px",
    fontWeight: "600",
  },
  cardLang: {
    fontSize: "0.7rem",
    fontWeight: "700",
    padding: "0.2rem 0.6rem",
    borderRadius: "5px",
    border: "1px solid",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardTitle: {
    fontSize: "1.15rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
    color: "#2d3436",
  },
  cardDesc: {
    fontSize: "0.88rem",
    color: "#636e72",
    marginBottom: "1.25rem",
    lineHeight: "1.7",
  },
  cardLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "gap 0.2s",
  },
  cardLinkArrow: {
    transition: "transform 0.2s",
  },
  cta: {
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    borderRadius: "16px",
    padding: "3rem",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(108, 92, 231, 0.25)",
  },
  ctaContent: {},
  ctaTitle: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "0.5rem",
  },
  ctaText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "1rem",
    marginBottom: "1.5rem",
    maxWidth: "450px",
    margin: "0 auto 1.5rem",
  },
  ctaBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.8rem 2rem",
    backgroundColor: "#fff",
    color: "#6c5ce7",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.95rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
};

export default Home;
