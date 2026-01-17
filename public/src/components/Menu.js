import React, { useEffect, useState } from "react";

export default function Menu({ config = {} }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000"; 

  const customStyles = `
    /* 1. Mniejsze kafelki w pionie */
    .menu-item-carousel .card {
        min-height: 320px !important;
        max-width: 320px !important;
        height: 320px !important;
        position: relative !important;
    }

    /* 2. Ukrywanie opisu (animacja) */
    .menu-item-carousel .card .info .info-back span {
        margin-top: 0;
        opacity: 0;
        height: 0;
        overflow: hidden;
        transition: all 0.3s ease;
        display: block;
    }

    .menu-item-carousel .card .info .info-back {
        background-color: #fb5849;
        padding: 15px 20px;
        width: 100%;
        margin: 0 !important;
        transition: all 0.3s ease;
        transform-origin: bottom;
    }

    /* 3. Tytuł */
    .menu-item-carousel .card .info .info-back h3 {
        margin: 0 !important;
        transition: all 0.5s ease;
        color: white;
        text-shadow: 0 2px 4px rgba(0,0,0,0.7);
    }

    .menu-item-carousel .card .info {
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        padding: 0 !important;
        z-index: 10;
        background: transparent;
        top: auto !important;
        transform: none !important;
        margin: 0 !important;
    }

    /* 5. HOVER: Logika wysuwania */
    .menu-item-carousel .card:hover .info {
        bottom: 0 !important;
        transition: bottom 0.5s ease;
    }

    /* Pokazujemy opis */
    .menu-item-carousel .card:hover .info .info-back span {
        opacity: 1;
        height: auto;
        margin-top: 5px;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }

    /* 6. Cena i waluta */
    .menu-item-carousel .price {
        width: 50px !important;
        height: 50px !important;
        background-color: #fb5849 !important;
        border-radius: 50%;
        position: absolute;
        top: 15px;
        left: 15px;
        display: flex !important;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }

    .menu-item-carousel .price h6 {
        margin: 0 !important;
        padding: 0 !important;
        font-size: 16px !important;
        color: #fff;
        display: flex;
        flex-direction: row;
        white-space: nowrap;
        line-height: 1;
        gap: 2px;
    }
    
    .menu-item-carousel .card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        z-index: 1;
        pointer-events: none;
    }
    
    .owl-carousel .owl-nav {
        position: absolute;
        bottom: -70px;
        width: 100%;
        text-align: center;
        display: block !important;
    }

    .owl-carousel .owl-nav button.owl-prev,
    .owl-carousel .owl-nav button.owl-next {
        width: 50px;
        height: 50px;
        line-height: 50px;
        background-color: #fb5849 !important;
        color: #fff !important;
        border-radius: 50%;
        margin: 0 10px;
        font-size: 24px !important;
        transition: all 0.3s ease;
        border: none;
        outline: none;
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        box-shadow: 0 5px 10px rgba(0,0,0,0.1);
    }

    .owl-carousel .owl-nav button.owl-prev:hover,
    .owl-carousel .owl-nav button.owl-next:hover {
        background-color: #ca3022 !important;
        transform: translateY(-3px);
    }

    .owl-carousel .owl-nav button.owl-prev span,
    .owl-carousel .owl-nav button.owl-next span {
        display: none !important;
    }

    .owl-carousel .owl-nav button.owl-prev::before,
    .owl-carousel .owl-nav button.owl-next::before,
    .owl-carousel .owl-nav button.owl-prev::after,
    .owl-carousel .owl-nav button.owl-next::after {
        content: none !important;
        display: none !important;
    }

    .owl-carousel .owl-nav button i {
        background: transparent !important;
        padding: 0;
        margin: 0;
    }

    .owl-theme .owl-nav { margin-top: 0 !important; }
  `;

  useEffect(() => {
    fetch(`${API_URL}/api/menu-items`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
           const visibleItems = res.data.filter((item) => item.is_visible_in_menu === true);
           const sortedItems = visibleItems.sort((a, b) => (a.position || 0) - (b.position || 0));
           setMenuItems(sortedItems);
        }
      })
      .catch((err) => console.error("Błąd menu:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || menuItems.length === 0) return;

    const initCarousel = () => {
      const $ = window.jQuery;
      if ($) {
        const $carousel = $(".owl-menu-item");
        if ($carousel.hasClass("owl-loaded")) {
          $carousel.trigger("destroy.owl.carousel"); 
          $carousel.removeClass("owl-loaded");
          $carousel.find(".owl-stage-outer").children().unwrap();
        }

        const shouldLoop = menuItems.length > 4;

        $carousel.owlCarousel({
          items: 5,
          loop: shouldLoop, 
          dots: false, 
          nav: true, 
          navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
          autoplay: true, 
          autoplayTimeout: 3000, 
          autoplayHoverPause: true, 
          margin: 30,
          responsive: {
            0: { items: 1, nav: false },
            600: { items: 2, nav: false },
            1000: { items: 5, nav: true },
          },
        });
      }
    };

    const timer = setTimeout(initCarousel, 100);

    return () => {
      clearTimeout(timer);
      const $ = window.jQuery;
      if ($ && $(".owl-menu-item").data("owl.carousel")) {
         $(".owl-menu-item").owlCarousel("destroy");
      }
    };
  }, [loading, menuItems]); 

  const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/400x300?text=No+Dish+Photo"; 
    if (url.startsWith("http")) return url;
    if (url.includes("assets/") || url.includes("images/")) return `/${url.replace("public/", "")}`;
    let cleanUrl = url.replace("public/", "");
    if (!cleanUrl.startsWith("/")) cleanUrl = `/${cleanUrl}`;
    return `${API_URL}${cleanUrl}`;
  };

  if (loading) return <div className="text-center py-5">Loading menu...</div>;

  return (
    <section className="section" id="menu" style={{ padding: "80px 0 120px 0" }}>
      {/* WSTRZYKUJEMY STYLE NADPISUJĄCE */}
      <style>{customStyles}</style>

      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="section-heading">
              <h6>Our Menu</h6>
              <h2>{config.our_menu_header || "Our selection of the best meals"}</h2>
            </div>
          </div>
        </div>
      </div>
      
      <div className="menu-item-carousel">
        <div className="col-lg-12">
          <div className="owl-menu-item owl-carousel">
            
            {menuItems.map((item) => (
              <div className="item" key={item.id}>
                <div
                  className="card card-image"
                  style={{
                    backgroundImage: `url(${getImageUrl(item.image_url)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  <div className="price">
                    <h6>
                        <span>{item.price}</span>
                        <span style={{ fontSize: '0.8em', marginLeft: '2px' }}>
                            {item.currency_code || '$'}
                        </span>
                    </h6>
                  </div>
                  
                  <div className="info">
                    <div className="info-back">
                      <h3>{item.name}</h3>
                      <span className="line-clamp-3">
                          {item.description}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {menuItems.length === 0 && (
                <div className="item">
                    <div className="card" style={{height: "320px", display: "flex", alignItems:"center", justifyContent:"center", backgroundColor: "#eee"}}>
                        <p style={{color: "#888"}}>No items available.</p>
                    </div>
                </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};