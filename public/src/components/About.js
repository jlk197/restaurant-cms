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
              {config.about_us_content && (
                <div
                  className="quill-content"
                  dangerouslySetInnerHTML={{ __html: config.about_us_content }}
                />
              )}
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
