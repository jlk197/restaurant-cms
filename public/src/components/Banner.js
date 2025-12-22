import React, { useEffect } from "react";

const Banner = ({ sliderImages = [], config = {} }) => {
  useEffect(() => {
    // Initialize or reinitialize the slider after images are loaded
    const initSlider = () => {
      const $ = window.jQuery;
      if ($) {
        const $slider = $(".Modern-Slider");

        // Destroy existing slider if it exists
        if ($slider.hasClass("slick-initialized")) {
          $slider.slick("unslick");
        }

        // Initialize slider
        $slider.slick({
          autoplay: true,
          autoplaySpeed: 10000,
          speed: 600,
          slidesToShow: 1,
          slidesToScroll: 1,
          pauseOnHover: false,
          dots: true,
          pauseOnDotsHover: true,
          cssEase: "linear",
          draggable: false,
          prevArrow: '<button class="PrevArrow"></button>',
          nextArrow: '<button class="NextArrow"></button>',
        });
      }
    };

    // Wait a bit for DOM to be ready
    const timer = setTimeout(initSlider, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup slider on unmount
      const $ = window.jQuery;
      if ($) {
        const $slider = $(".Modern-Slider");
        if ($slider.hasClass("slick-initialized")) {
          $slider.slick("unslick");
        }
      }
    };
  }, [sliderImages]); // Reinitialize when sliderImages change

  return (
    <div id="top">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-4">
            <div className="left-content">
              <div className="inner-content">
                <h4>{config.site_name || "Klassy Cafe"}</h4>
                <h6>{config.site_tagline || "THE BEST EXPERIENCE"}</h6>
                <div className="main-white-button scroll-to-section">
                  <a href="#reservation">Make A Reservation</a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="main-banner header-text">
              <div className="Modern-Slider">
                {sliderImages.length > 0 ? (
                  sliderImages.map((image, index) => (
                    <div className="item" key={index}>
                      <div className="img-fill">
                        <img src={image.image_url} alt={`Slide ${index + 1}`} />
                      </div>
                    </div>
                  ))
                ) : (
                  // Default slides if no images from API
                  <>
                    <div className="item">
                      <div className="img-fill">
                        <img src="assets/images/slide-01.jpg" alt="" />
                      </div>
                    </div>
                    <div className="item">
                      <div className="img-fill">
                        <img src="assets/images/slide-02.jpg" alt="" />
                      </div>
                    </div>
                    <div className="item">
                      <div className="img-fill">
                        <img src="assets/images/slide-03.jpg" alt="" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
