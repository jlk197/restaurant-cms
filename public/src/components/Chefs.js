import React from "react";

const Chefs = ({ chefs = [], config = {} }) => {
  console.log("Chefs:", config.our_chefs_header);
  return (
    <section className="section" id="chefs">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 offset-lg-4 text-center">
            <div className="section-heading">
              <h6>Our Chefs</h6>
              <h2>
                {config.our_chefs_header ||
                  "We offer the best ingredients for you"}
              </h2>
            </div>
          </div>
        </div>
        <div className="row">
          {chefs.length > 0 ? (
            chefs.map((chef, index) => (
              <div className="col-lg-4" key={chef.id}>
                <div className="chef-item">
                  <div className="thumb">
                    <div className="overlay"></div>
                    <ul className="social-icons">
                      {chef.facebook_link && (
                        <li>
                          <a href={chef.facebook_link}>
                            <i className="fa fa-facebook"></i>
                          </a>
                        </li>
                      )}
                      {chef.twitter_link && (
                        <li>
                          <a href={chef.twitter_link}>
                            <i className="fa fa-twitter"></i>
                          </a>
                        </li>
                      )}
                      {chef.instagram_link && (
                        <li>
                          <a href={chef.instagram_link}>
                            <i className="fa fa-instagram"></i>
                          </a>
                        </li>
                      )}
                    </ul>
                    <img
                      src={`assets/images/chefs-0${(index % 3) + 1}.jpg`}
                      alt={`${chef.name} ${chef.surname}`}
                    />
                  </div>
                  <div className="down-content">
                    <h4>
                      {chef.name} {chef.surname}
                    </h4>
                    <span>{chef.specialization}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Default chefs if no data from API
            <>
              <div className="col-lg-4">
                <div className="chef-item">
                  <div className="thumb">
                    <div className="overlay"></div>
                    <ul className="social-icons">
                      <li>
                        <a href="#">
                          <i className="fa fa-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-instagram"></i>
                        </a>
                      </li>
                    </ul>
                    <img src="assets/images/chefs-01.jpg" alt="Chef #1" />
                  </div>
                  <div className="down-content">
                    <h4>Randy Walker</h4>
                    <span>Pastry Chef</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="chef-item">
                  <div className="thumb">
                    <div className="overlay"></div>
                    <ul className="social-icons">
                      <li>
                        <a href="#">
                          <i className="fa fa-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-instagram"></i>
                        </a>
                      </li>
                    </ul>
                    <img src="assets/images/chefs-02.jpg" alt="Chef #2" />
                  </div>
                  <div className="down-content">
                    <h4>David Martin</h4>
                    <span>Cookie Chef</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="chef-item">
                  <div className="thumb">
                    <div className="overlay"></div>
                    <ul className="social-icons">
                      <li>
                        <a href="#">
                          <i className="fa fa-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-instagram"></i>
                        </a>
                      </li>
                    </ul>
                    <img src="assets/images/chefs-03.jpg" alt="Chef #3" />
                  </div>
                  <div className="down-content">
                    <h4>Peter Perkson</h4>
                    <span>Pancake Chef</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Chefs;
