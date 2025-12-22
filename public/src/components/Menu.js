import { useEffect } from "react";

const Menu = ({ config = {} }) => {
  useEffect(() => {
    // Initialize Owl Carousel for static menu items
    const initCarousel = () => {
      const $ = window.jQuery;
      if ($) {
        const $carousel = $(".owl-menu-item");

        // Destroy existing carousel if it exists
        if ($carousel.hasClass("owl-loaded")) {
          $carousel.owlCarousel("destroy");
        }

        // Initialize carousel
        $carousel.owlCarousel({
          items: 5,
          loop: true,
          dots: true,
          nav: true,
          autoplay: true,
          margin: 30,
          responsive: {
            0: {
              items: 1,
            },
            600: {
              items: 2,
            },
            1000: {
              items: 5,
            },
          },
        });
      }
    };

    // Wait a bit for DOM to be ready
    const timer = setTimeout(initCarousel, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup carousel on unmount
      const $ = window.jQuery;
      if ($) {
        const $carousel = $(".owl-menu-item");
        if ($carousel.hasClass("owl-loaded")) {
          $carousel.owlCarousel("destroy");
        }
      }
    };
  }, []); // Initialize once on mount

  return (
    <section className="section" id="menu">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="section-heading">
              <h6>Our Menu</h6>
              <h2>
                {config.our_menu_header ||
                  "Our selection of cakes with quality taste"}
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="menu-item-carousel">
        <div className="col-lg-12">
          <div className="owl-menu-item owl-carousel">
            {/* Static menu items */}
            <>
              <div className="item">
                <div
                  className="card card-image"
                  style={{
                    backgroundImage: "url(assets/images/menu-item-01.jpg)",
                  }}
                >
                  <div className="price">
                    <h6>$14</h6>
                  </div>
                  <div className="info">
                    <div className="info-back">
                      <h3>Chocolate Cake</h3>
                      <span>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div
                  className="card card-image"
                  style={{
                    backgroundImage: "url(assets/images/menu-item-02.jpg)",
                  }}
                >
                  <div className="price">
                    <h6>$22</h6>
                  </div>
                  <div className="info">
                    <div className="info-back">
                      <h3>Klassy Pancake</h3>
                      <span>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div
                  className="card card-image"
                  style={{
                    backgroundImage: "url(assets/images/menu-item-03.jpg)",
                  }}
                >
                  <div className="price">
                    <h6>$18</h6>
                  </div>
                  <div className="info">
                    <div className="info-back">
                      <h3>Tall Klassy Bread</h3>
                      <span>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div
                  className="card card-image"
                  style={{
                    backgroundImage: "url(assets/images/menu-item-04.jpg)",
                  }}
                >
                  <div className="price">
                    <h6>$10</h6>
                  </div>
                  <div className="info">
                    <div className="info-back">
                      <h3>Blueberry CheeseCake</h3>
                      <span>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div
                  className="card card-image"
                  style={{
                    backgroundImage: "url(assets/images/menu-item-05.jpg)",
                  }}
                >
                  <div className="price">
                    <h6>$8.50</h6>
                  </div>
                  <div className="info">
                    <div className="info-back">
                      <h3>Klassy Cup Cake</h3>
                      <span>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div
                  className="card card-image"
                  style={{
                    backgroundImage: "url(assets/images/menu-item-06.jpg)",
                  }}
                >
                  <div className="price">
                    <h6>$7.25</h6>
                  </div>
                  <div className="info">
                    <div className="info-back">
                      <h3>Klassic Cake</h3>
                      <span>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;
