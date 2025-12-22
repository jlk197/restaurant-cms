import React from "react";

const Menu = ({ menuItems = [] }) => {
  return (
    <section className="section" id="menu">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="section-heading">
              <h6>Our Menu</h6>
              <h2>Our selection of cakes with quality taste</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="menu-item-carousel">
        <div className="col-lg-12">
          <div className="owl-menu-item owl-carousel">
            {menuItems.length > 0 ? (
              menuItems.map((item, index) => (
                <div className="item" key={item.id}>
                  <div
                    className="card card-image"
                    style={{
                      backgroundImage: `url(assets/images/menu-item-0${
                        (index % 6) + 1
                      }.jpg)`,
                    }}
                  >
                    <div className="price">
                      <h6>
                        {item.currency_code || "$"}
                        {item.price}
                      </h6>
                    </div>
                    <div className="info">
                      <div className="info-back">
                        <h3>{item.name}</h3>
                        <span>{item.description}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Default menu items if no data from API
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
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit.
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
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit.
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
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit.
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
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit.
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
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit.
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
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;
