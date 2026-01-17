import React, { useEffect, useState } from "react";

export default function ChefsList({ config = {} }) {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChef, setSelectedChef] = useState(null);

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/chefs`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
           // --- ZMIANA TUTAJ: Dodano warunek && chef.is_visible_in_menu === true ---
           const activeChefs = res.data.filter((chef) => 
               chef.is_active === true && chef.is_visible_in_menu === true
           );
           
           const sortedChefs = activeChefs.sort((a, b) => (a.position || 0) - (b.position || 0));
           setChefs(sortedChefs);
        }
      })
      .catch((err) => console.error("Błąd:", err))
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.includes("assets/") || url.includes("images/")) return `/${url.replace("public/", "")}`;
    let cleanUrl = url.replace("public/", "");
    if (!cleanUrl.startsWith("/")) cleanUrl = `/${cleanUrl}`;
    return `${API_URL}${cleanUrl}`;
  };

  const ensureAbsoluteUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  if (loading) return <div className="text-center py-5"><h6>Loading chefs...</h6></div>;

  return (
    <>
    <section className="section" id="chefs">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 offset-lg-4 text-center">
            <div className="section-heading">
              <h6>Our Chefs</h6>
              <h2>{config.our_chefs_header || "We offer the best ingredients for you"}</h2>
            </div>
          </div>
        </div>

        <div className="row">
          {chefs.map((chef) => (
            <div className="col-lg-4" key={chef.id}>
              <div 
                className="chef-item" 
                style={{ cursor: "pointer" }} 
                onClick={() => setSelectedChef(chef)}
              >
                <div className="thumb">
                  <div className="overlay"></div>
                  <ul className="social-icons">
                      <li><i className="fa fa-info-circle"></i></li>
                  </ul>
                  {chef.image_url ? (
                    <img
                      src={getImageUrl(chef.image_url)}
                      alt={chef.name}
                      style={{ width: "100%", height: "400px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x600?text=No+Photo";
                      }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "400px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
                        <span>No Photo</span>
                    </div>
                  )}
                </div>
                <div className="down-content">
                  <h4>{chef.name} {chef.surname}</h4>
                  <span>{chef.specialization}</span>
                </div>
              </div>
            </div>
          ))}

          {chefs.length === 0 && (
            <div className="col-lg-12 text-center"><p>No chefs found (active & visible).</p></div>
          )}
        </div>
      </div>
    </section>

    {/* --- MODAL --- */}
    {selectedChef && (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px"
        }} onClick={() => setSelectedChef(null)}>
            
            <div style={{
                backgroundColor: "white", padding: "30px", borderRadius: "8px",
                maxWidth: "500px", width: "100%", position: "relative", textAlign: "center",
                maxHeight: "90vh", 
                overflowY: "auto"
            }} onClick={(e) => e.stopPropagation()}>
                
                <button 
                    onClick={() => setSelectedChef(null)}
                    style={{ position: "absolute", top: "10px", right: "15px", border: "none", background: "none", fontSize: "24px", cursor: "pointer", zIndex: 10 }}
                >
                    &times;
                </button>

                {selectedChef.image_url ? (
                    <img 
                        src={getImageUrl(selectedChef.image_url)} 
                        alt={selectedChef.name} 
                        style={{ 
                            width: "150px", 
                            height: "150px", 
                            maxWidth: "100%", 
                            borderRadius: "50%", 
                            objectFit: "cover", 
                            margin: "0 auto 20px" 
                        }}
                    />
                ) : (
                    <div style={{ width: "150px", height: "150px", borderRadius: "50%", backgroundColor: "#eee", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>No Photo</div>
                )}

                <h3 style={{ margin: "10px 0", fontSize: "24px" }}>{selectedChef.name} {selectedChef.surname}</h3>
                <p style={{ color: "#fb5849", fontWeight: "bold", marginBottom: "20px" }}>{selectedChef.specialization}</p>
                
                <div style={{ display: "flex", justifyContent: "center", gap: "15px", fontSize: "20px" }}>
                    {selectedChef.facebook_link && <a href={ensureAbsoluteUrl(selectedChef.facebook_link)} target="_blank" rel="noreferrer" style={{ color: "#3b5998" }}><i className="fa fa-facebook"></i></a>}
                    {selectedChef.twitter_link && <a href={ensureAbsoluteUrl(selectedChef.twitter_link)} target="_blank" rel="noreferrer" style={{ color: "#1da1f2" }}><i className="fa fa-twitter"></i></a>}
                    {selectedChef.instagram_link && <a href={ensureAbsoluteUrl(selectedChef.instagram_link)} target="_blank" rel="noreferrer" style={{ color: "#c13584" }}><i className="fa fa-instagram"></i></a>}
                </div>

                <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
                    <p>Click anywhere outside to close</p>
                </div>
            </div>
        </div>
    )}
    </>
  );
}