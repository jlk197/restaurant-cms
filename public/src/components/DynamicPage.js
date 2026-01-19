import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DynamicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Pobieramy slug. Jeśli strona główna ma podstrony (np. /about/team), 
    // slug może zawierać ukośniki.
    const safeSlug = (slug || "").replace(/^\//, ""); 

    // Używamy encodeURIComponent, aby bezpiecznie przesłać slug z ukośnikami do API
    fetch(`http://localhost:5000/api/pages/slug/${encodeURIComponent(safeSlug)}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setPageData(res.data);
        } else {
          console.error("Page error:", res.error);
          // Opcjonalnie: Przekieruj na 404 jeśli nie znaleziono
          // navigate("/404"); 
        }
      })
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <div id="preloader"><div className="jumper"><div></div><div></div><div></div></div></div>;
  if (!pageData) return null;

  const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/1920x600?text=No+Image";
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url.replace("public/", "")}`;
  };

  const ensureAbsoluteUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const styles = `
    .section-heading { margin-bottom: 60px; text-align: center; }
    .section-heading h2 { font-size: 28px; font-weight: 800; color: #2a2a2a; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px; }
    .section-heading h6 { font-size: 14px; font-weight: 500; color: #fb5849; text-transform: uppercase; letter-spacing: 2px; }
    
    .truncate-text {
        display: -webkit-box;
        -webkit-line-clamp: 3; 
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .clickable-card { cursor: pointer; transition: transform 0.3s ease; }
    .clickable-card:hover { transform: translateY(-5px); }

    /* MENU ITEM CARD */
    .menu-card { background: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 0 15px rgba(0,0,0,0.05); height: 100%; }
    .menu-thumb { position: relative; overflow: hidden; height: 220px; }
    .menu-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .price-tag { position: absolute; top: 15px; right: 15px; background-color: #fb5849; color: #fff; font-size: 16px; font-weight: 700; padding: 8px 15px; border-radius: 5px; }
    .menu-content { padding: 25px; }
    .menu-content h4 { font-size: 19px; font-weight: 700; color: #2a2a2a; margin-bottom: 10px; }
    .menu-content p { font-size: 14px; color: #7a7a7a; line-height: 25px; margin-bottom: 0; }

    /* CHEF CARD */
    .chef-card { position: relative; margin-bottom: 30px; border-radius: 10px; overflow: hidden; background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .chef-thumb img { width: 100%; height: 320px; object-fit: cover; object-position: top center; }
    .chef-content { padding: 25px; text-align: center; }
    .chef-content h4 { font-size: 19px; font-weight: 700; color: #2a2a2a; margin-bottom: 5px; }
    .chef-content span { font-size: 13px; color: #fb5849; font-weight: 500; }

    /* PROMO CARD */
    .promo-card { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 30px; height: 100%; position: relative; overflow: hidden; }
    .promo-badge { display: inline-block; background: #fb5849; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; margin-bottom: 15px; }
    .promo-card h4 { font-size: 22px; font-weight: 700; margin-bottom: 15px; color: #2a2a2a; }
    .promo-card p { font-size: 15px; color: #777; line-height: 1.8; margin-bottom: 0; }
    .promo-image { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }

    /* MODAL STYLES */
    .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 9999;
        display: flex; justify-content: center; align-items: center;
        padding: 20px;
        opacity: 0; animation: fadeIn 0.3s forwards;
    }
    .modal-content-box {
        background: #fff; width: 100%; max-width: 600px; max-height: 90vh;
        border-radius: 15px; overflow-y: auto; position: relative;
        display: flex; flex-direction: column;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        transform: scale(0.9); animation: popIn 0.3s forwards;
    }
    .modal-close-btn {
        position: absolute; top: 15px; right: 15px;
        background: rgba(255,255,255,0.8); border: none; width: 35px; height: 35px; border-radius: 50%;
        font-size: 24px; color: #333; cursor: pointer; z-index: 10; 
        display: flex; justify-content: center; align-items: center;
    }
    .modal-close-btn:hover { background: #fb5849; color: #fff; }

    .modal-image-wrapper { width: 100%; height: 350px; flex-shrink: 0; background: #f0f0f0; }
    .modal-image-wrapper img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    .modal-body { padding: 30px; }

    /* --- DESC WRAPPER STYLES --- */
    .desc-wrapper {
        background-color: #f7f7f7;
        border-bottom: 1px solid #eee;
        overflow: hidden;
        width: 100%;
    }

    .desc-content {
        text-align: center;
        width: 100%;
        max-width: 100%;     
        margin: 0 auto;
        padding: 40px 20px; 
        
        overflow-wrap: normal !important; 
        word-wrap: normal !important;
        word-break: normal !important; 
        hyphens: none !important;
        white-space: normal !important;
    }

    .desc-content, 
    .desc-content * { 
        font-size: 24px !important;
        line-height: 1.4 !important;
        color: #2a2a2a !important;
        font-family: 'Poppins', sans-serif !important;
        
        margin: 0 !important;
        padding: 10 !important;
        
        background: transparent !important;
        max-width: 100% !important;
        width: auto !important;
        
        word-break: normal !important;
        hyphens: none !important;
    }

    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes popIn { to { transform: scale(1); } }
  `;

  const closeModal = () => setSelectedItem(null);

  const renderModal = () => {
    if (!selectedItem) return null;
    const item = selectedItem;
    const isMenu = item._uiType === 'menu';
    const isChef = item._uiType === 'chef';
    const isPromo = item._uiType === 'promo';

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={closeModal}>&times;</button>
                
                {item.image_url && (
                    <div className="modal-image-wrapper">
                        <img src={getImageUrl(item.image_url)} alt={item.name || item.title} />
                    </div>
                )}

                <div className="modal-body">
                    <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '5px' }}>
                        {item.name || item.title} 
                        {isChef && item.surname ? ` ${item.surname}` : ''}
                    </h2>

                    {isMenu && <div style={{ color: '#fb5849', fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>{item.price} {item.currency_code || '$'}</div>}
                    {isChef && <h5 style={{ color: '#fb5849', marginBottom: '15px', fontWeight: '600' }}>{item.specialization}</h5>}
                    {isPromo && item.type && <span className="promo-badge" style={{ marginBottom: '15px' }}>{item.type}</span>}

                    <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#555' }}>
                        {item.description || "No description available."}
                    </div>

                    {isChef && (
                         <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <strong style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>Social Profiles:</strong>
                            {item.facebook_link && <a href={ensureAbsoluteUrl(item.facebook_link)} target="_blank" rel="noreferrer" style={{ fontSize: '22px', marginRight: '15px', color: '#3b5998' }}><i className="fa fa-facebook"></i></a>}
                            {item.twitter_link && <a href={ensureAbsoluteUrl(item.twitter_link)} target="_blank" rel="noreferrer" style={{ fontSize: '22px', marginRight: '15px', color: '#1da1f2' }}><i className="fa fa-twitter"></i></a>}
                            {item.instagram_link && <a href={ensureAbsoluteUrl(item.instagram_link)} target="_blank" rel="noreferrer" style={{ fontSize: '22px', marginRight: '15px', color: '#C13584' }}><i className="fa fa-instagram"></i></a>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  const renderMenuItems = (items) => {
    const activeItems = (items || []).filter(item => item.is_active !== false);
    if (activeItems.length === 0) return null;

    return (
      <section className="section" style={{ padding: "80px 0", backgroundColor: "#fbfbfb" }}>
        <div className="container">
          <div className="row"><div className="col-12"><div className="section-heading"><h6>Our Menu</h6><h2>Special Selection</h2></div></div></div>
          <div className="row">
            {activeItems.map((item) => (
              <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                <div className="menu-card clickable-card" onClick={() => setSelectedItem({ ...item, _uiType: 'menu' })}>
                  <div className="menu-thumb">
                    <div className="price-tag">{item.price} {item.currency_code}</div>
                    <img src={getImageUrl(item.image_url)} alt={item.name} />
                  </div>
                  <div className="menu-content">
                    <h4>{item.name}</h4>
                    <p className="truncate-text">{item.description}</p>
                    <span style={{ fontSize: '12px', color: '#fb5849', fontWeight: 'bold', marginTop: '10px', display: 'inline-block' }}>Details &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderChefs = (chefs) => {
    const activeChefs = (chefs || []).filter(item => item.is_active !== false);
    if (activeChefs.length === 0) return null;

    return (
      <section className="section" style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="row"><div className="col-12"><div className="section-heading"><h6>Our Experts</h6><h2>Meet The Chefs</h2></div></div></div>
          <div className="row justify-content-center">
            {activeChefs.map((chef) => (
              <div key={chef.id} className="col-lg-4 col-md-6 mb-4">
                <div className="chef-card clickable-card" onClick={() => setSelectedItem({ ...chef, _uiType: 'chef' })}>
                  <div className="chef-thumb">
                    <img src={getImageUrl(chef.image_url)} alt={chef.name} />
                  </div>
                  <div className="chef-content">
                    <h4>{chef.name} {chef.surname}</h4>
                    <span>{chef.specialization}</span>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#fb5849' }}>View Profile &rarr;</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderPageItems = (items) => {
    const activeItems = (items || []).filter(item => item.is_active !== false);
    if (activeItems.length === 0) return null;

    return (
      <section className="section" style={{ padding: "80px 0", borderTop: "1px solid #eee" }}>
        <div className="container">
          <div className="row"><div className="col-12"><div className="section-heading"><h6>Don't Miss Out</h6><h2>Special Offers & Info</h2></div></div></div>
          <div className="row">
            {activeItems.map((item) => (
              <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                <div className="promo-card clickable-card" onClick={() => setSelectedItem({ ...item, _uiType: 'promo' })}>
                  {item.type && <span className="promo-badge">{item.type}</span>}
                  {item.image_url && item.image_url.length > 5 && (
                      <img src={getImageUrl(item.image_url)} alt={item.title} className="promo-image" />
                  )}
                  <h4>{item.title}</h4>
                  <p className="truncate-text">{item.description}</p>
                  <span style={{ fontSize: '12px', color: '#fb5849', fontWeight: 'bold', marginTop: '15px', display: 'inline-block' }}>Read more &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <style>{styles}</style>
      
      {/* 1. HEADER BANNER */}
      <div className="heading-page header-text" style={{ 
          backgroundImage: 
            `url(${getImageUrl(
                pageData.header_image_url || 
                pageData.image_url || 
                pageData.image || 
                "https://placehold.co/1920x600?text=No+Image"
            )})`, 
          backgroundSize: 'cover', backgroundPosition: 'center', padding: '150px 0 100px 0', textAlign: 'center', color: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row">
            <div className="col-lg-12">
              <h6 style={{color: '#fb5849', letterSpacing: '2px', textTransform: 'uppercase'}}>Klassy Cafe</h6>
              <h2 style={{fontSize: '40px', fontWeight: '800', textTransform: 'uppercase', marginTop: '15px'}}>{pageData.title}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DESCRIPTION SECTION */}
      {pageData.description && (
        <div className="desc-wrapper">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div 
                            className="desc-content"
                            dangerouslySetInnerHTML={{ __html: pageData.description }}
                        />
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 3. CONTENT SECTION */}
      {pageData.content && (
        <section className="section" style={{ padding: "80px 0" }}>
            <div className="container"><div className="row"><div className="col-lg-12">
                <div className="dynamic-content" dangerouslySetInnerHTML={{ __html: pageData.content }} style={{ fontSize: "16px", lineHeight: "1.8", color: "#444" }} />
            </div></div></div>
        </section>
      )}

      {/* 4. DYNAMIC SECTIONS */}
      {renderChefs(pageData.chefs)}
      {renderMenuItems(pageData.menu_items)}
      {renderPageItems(pageData.page_items)}
      
      {/* 5. MODAL */}
      {renderModal()}
    </>
  );
};

export default DynamicPage;