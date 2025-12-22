import React from "react";

const Header = ({ navigation = [], config = {} }) => {
  return (
    <header className="header-area header-sticky">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="main-nav">
              <a href="index.html" className="logo">
                {config.header_logo ? (
                  <img
                    src={config.header_logo}
                    alt="klassy cafe html template"
                    style={{ maxWidth: "100%", maxHeight: "80px" }}
                  />
                ) : (
                  <img
                    src="assets/images/klassy-logo.png"
                    alt="klassy cafe html template"
                  />
                )}
              </a>
              <ul className="nav">
                <li className="scroll-to-section">
                  <a href="#top" className="active">
                    Home
                  </a>
                </li>
                <li className="scroll-to-section">
                  <a href="#about">About</a>
                </li>
                <li className="scroll-to-section">
                  <a href="#menu">Menu</a>
                </li>
                <li className="scroll-to-section">
                  <a href="#chefs">Chefs</a>
                </li>
                <li className="submenu">
                  <a href="#">Features</a>
                  <ul>
                    <li>
                      <a href="#">Features Page 1</a>
                    </li>
                    <li>
                      <a href="#">Features Page 2</a>
                    </li>
                    <li>
                      <a href="#">Features Page 3</a>
                    </li>
                    <li>
                      <a href="#">Features Page 4</a>
                    </li>
                  </ul>
                </li>
                <li className="scroll-to-section">
                  <a href="#reservation">Contact Us</a>
                </li>
              </ul>
              <a className="menu-trigger">
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
