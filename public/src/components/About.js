import React from "react";

const About = ({ config = {} }) => {
  const getYouTubeThumbnail = (url) => {
    if (!url) return "assets/images/about-video-bg.jpg";

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }

    return "assets/images/about-video-bg.jpg";
  };

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-md-6 col-xs-12">
            <div className="left-text-content">
              <div className="section-heading">
                <h6>About Us</h6>
              </div>
              {config.about_us_content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: config.about_us_content }}
                />
              ) : (
                <p>
                  Klassy Cafe is one of the best restaurant HTML templates with
                  Bootstrap v4.5.2 CSS framework. You can download and feel free
                  to use this website template layout for your restaurant
                  business. You are allowed to use this template for commercial
                  purposes. You are NOT allowed to redistribute the template ZIP
                  file on any template download website. Please contact us for
                  more information.
                </p>
              )}
              <div className="row">
                <div className="col-4">
                  <img src="assets/images/about-thumb-01.jpg" alt="" />
                </div>
                <div className="col-4">
                  <img src="assets/images/about-thumb-02.jpg" alt="" />
                </div>
                <div className="col-4">
                  <img src="assets/images/about-thumb-03.jpg" alt="" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-xs-12">
            <div className="right-content">
              <div className="thumb">
                <a
                  href={config.about_us_video || "http://youtube.com"}
                  target="_blank"
                  rel="nofollow noreferrer"
                >
                  <i className="fa fa-play"></i>
                </a>
                <img src={getYouTubeThumbnail(config.about_us_video)} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
