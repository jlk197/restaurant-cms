import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ navigation = [], config = {} }) => {
  const [navItems, setNavItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  // 1. PRZETWARZANIE DANYCH
  useEffect(() => {
    if (navigation && navigation.length > 0) {
      const itemsCopy = [...navigation];
      const sortedItems = itemsCopy.sort((a, b) => (a.position || 0) - (b.position || 0));
      const tree = buildNavigationTree(sortedItems);
      setNavItems(tree);
    }
  }, [navigation]);

  const buildNavigationTree = (items) => {
    const map = {};
    const roots = [];
    items.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });
    items.forEach((item) => {
      if (item.navigation_id && map[item.navigation_id]) {
        map[item.navigation_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    return roots;
  };

  const isActive = (item) => {
    if (item.link_type === 'internal') {
      return location.pathname === item.url;
    }
    if (item.link_type === 'anchor') {
      if (isHomePage) {
        return location.hash === item.url;
      }
      return false;
    }
    return false;
  };

  const renderLinkTag = (item, className = "") => {
    const activeClass = isActive(item) ? "active" : "";
    const finalClass = `${className} ${activeClass}`.trim();

    // 1. Link Zewnętrzny
    if (item.link_type === "external") {
      return (
        <a href={item.url} target="_blank" rel="noreferrer" className={finalClass}>
          {item.title}
        </a>
      );
    }

    if (item.link_type === "anchor") {
      let href = item.url;

      if (!isHomePage) {
        href = item.url.startsWith("/") ? item.url : `/${item.url}`;
        
        return (
            <Link to={href} className={finalClass}>
              {item.title}
            </Link>
        );
      }
      return (
        <a href={href} className={finalClass}>
          {item.title}
        </a>
      );
    }

    // 3. Strona Wewnętrzna
    return (
      <Link to={item.url} className={finalClass}>
        {item.title}
      </Link>
    );
  };

  return (
    <header className="header-area header-sticky">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="main-nav">
              
              <Link to="/" className="logo">
                {config.header_logo ? (
                  <img
                    src={config.header_logo}
                    alt="Logo"
                    style={{ maxWidth: "100%", maxHeight: "80px" }}
                  />
                ) : (
                  <h3 style={{lineHeight: '80px', color: '#fb5849'}}>Klassy</h3>
                )}
              </Link>

              <ul 
                className={`nav ${mobileMenuOpen ? "active" : ""}`} 
                style={{ display: mobileMenuOpen ? 'block' : undefined }}
              >
                {navItems.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;

                  if (hasChildren) {
                    return (
                      <li key={item.id} className="submenu">
                        <a href="#!" onClick={(e) => e.preventDefault()}>
                            {item.title}
                        </a>
                        <ul>
                          {item.children.map((child) => (
                            <li key={child.id}>
                                {renderLinkTag(child)}
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  }

                  return (
                    <li key={item.id} className="scroll-to-section">
                      {renderLinkTag(item)}
                    </li>
                  );
                })}
              </ul>

              <a 
                className={`menu-trigger ${mobileMenuOpen ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ cursor: "pointer" }}
              >
                <span>Menu</span>
              </a>

            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;