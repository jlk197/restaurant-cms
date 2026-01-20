import React, { useState } from "react";

const Reservation = ({ contactItems = [], config = {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "",
    date: "",
    time: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reservation submitted:", formData);
    alert("Reservation submitted!");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const groupedContacts = contactItems.reduce((acc, item) => {
    if (item.contact_type_value) {
      if (!acc[item.contact_type_value]) {
        acc[item.contact_type_value] = [];
      }
      acc[item.contact_type_value].push(item);
    }
    return acc;
  }, {});


  return (
    <section className="section" id="reservation">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 align-self-center">
            <div className="left-text-content">
              <div className="section-heading">
                <h6>Contact Us</h6>
              </div>
              {config.contact_us_content && (
                <div
                  className="quill-content"
                  dangerouslySetInnerHTML={{ __html: config.contact_us_content }}
                />
              )}
              {Object.keys(groupedContacts).length > 0 && (
                <div className="row">
                  {Object.entries(groupedContacts).map(
                    ([contactType, items]) => (
                      <div
                        className="col-lg-6 col-md-6 mb-4 mt-2"
                        key={contactType}
                      >
                        <div className="phone" style={{ position: "relative", paddingTop: "40px" }}>
                          {items[0].contact_type_icon_url ? (
                            <div
                              style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                backgroundColor: "#fb5849",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "absolute",
                                top: "-40px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              }}
                            >
                              <img
                                src={items[0].contact_type_icon_url}
                                alt={contactType}
                                style={{
                                  maxWidth: "40px",
                                  maxHeight: "40px",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          ) : (
                            <i className={`fa phone`}></i>
                          )}
                          <h4>{contactType}</h4>
                          <span>
                            {items.map((item, idx) => (
                              <React.Fragment key={item.id}>
                                {item.value}
                                {idx < items.length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="contact-form">
              <form id="contact" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-12">
                    <h4>Table Reservation</h4>
                  </div>
                  <div className="col-lg-6 col-sm-12">
                    <fieldset>
                      <input
                        name="name"
                        type="text"
                        className="form-control"
                        placeholder="Your Name*"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </fieldset>
                  </div>
                  <div className="col-lg-6 col-sm-12">
                    <fieldset>
                      <input
                        name="email"
                        type="email"
                        className="form-control"
                        placeholder="Your Email Address"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </fieldset>
                  </div>
                  <div className="col-lg-6 col-sm-12">
                    <fieldset>
                      <input
                        name="phone"
                        type="text"
                        className="form-control"
                        placeholder="Phone Number*"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </fieldset>
                  </div>
                  <div className="col-6">
                    <fieldset>
                      <select
                        name="guests"
                        className="form-control"
                        value={formData.guests}
                        onChange={handleChange}
                      >
                        <option value="">How Many Persons?</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </select>
                    </fieldset>
                  </div>
                  <div className="col-lg-6">
                    <div id="filterDate2">
                      <div
                        className="input-group date"
                        data-date-format="dd/mm/yyyy"
                      >
                        <input
                          name="date"
                          className="form-control"
                          type="text"
                          placeholder="dd/mm/yyyy"
                          value={formData.date}
                          onChange={handleChange}
                        />
                        <div className="input-group-addon">
                          <span className="glyphicon glyphicon-th"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12">
                    <fieldset>
                      <input
                        name="time"
                        type="text"
                        className="form-control"
                        placeholder="Time"
                        value={formData.time}
                        onChange={handleChange}
                      />
                    </fieldset>
                  </div>
                  <div className="col-lg-12">
                    <fieldset>
                      <textarea
                        name="message"
                        rows="6"
                        className="form-control"
                        placeholder="Message"
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </fieldset>
                  </div>
                  <div className="col-lg-12">
                    <fieldset>
                      <button type="submit" className="main-button-icon">
                        Make A Reservation
                      </button>
                    </fieldset>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;
