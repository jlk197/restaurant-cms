import React from "react";

const Footer = ({ config = {} }) => {
  return (
    <footer>
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-xs-12">
            <div className="right-text-content">
              <ul className="social-icons">
                {config.facebook_link && (
                  <li>
                    <a
                      href={config.facebook_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-facebook"></i>
                    </a>
                  </li>
                )}
                {config.twitter_link && (
                  <li>
                    <a
                      href={config.twitter_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-twitter"></i>
                    </a>
                  </li>
                )}
                {config.linkedin_link && (
                  <li>
                    <a
                      href={config.linkedin_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-linkedin"></i>
                    </a>
                  </li>
                )}
                {config.instagram_link && (
                  <li>
                    <a
                      href={config.instagram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-instagram"></i>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="logo">
              <a href="index.html">
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
            </div>
          </div>
          <div className="col-lg-4 col-xs-12">
            <div className="left-text-content">
              <p>
                © Copyright Klassy Cafe Co.
                <br />
                Design:{" "}
                <a
                  rel="nofollow noopener"
                  href="https://templatemo.com"
                  target="_blank"
                >
                  TemplateMo
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
