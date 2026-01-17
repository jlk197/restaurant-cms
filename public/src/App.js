import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Preloader from "./components/Preloader";
import Header from "./components/Header";
import Banner from "./components/Banner";
import About from "./components/About";
import Menu from "./components/Menu";
import Chefs from "./components/Chefs";
import Reservation from "./components/Reservation";
import Footer from "./components/Footer";
import apiService from "./api/api_service";
import DynamicPage from "./components/DynamicPage";

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    configuration: {},
    navigation: [],
    sliderImages: [],
    pages: [],
    chefs: [],
    contactItems: [],
    currencies: [],
  });

  useEffect(() => {
    Promise.all([
      apiService.getAllConfiguration(),
      apiService.getAllNavigation(),
      apiService.getAllSliderImages(),
      apiService.getAllPages(),
      apiService.getAllChefs(),
      apiService.getAllContactItems(),
      apiService.getAllCurrencies(),
    ])
      .then(([config, nav, slider, pages, chefs, contact, currencies]) => {
        const configObj = {};
        if (config.success) {
          config.data.forEach((item) => {
            configObj[item.key] = item.value;
          });
        }

        setData({
          configuration: configObj,
          navigation: nav.success
            ? nav.data.filter((item) => item.is_active)
            : [],
          sliderImages: slider.success
            ? slider.data.filter((item) => item.is_active)
            : [],
          pages: pages.success ? pages.data : [],
          chefs: chefs.success ? chefs.data : [],
          contactItems: contact.success
            ? contact.data.filter((item) => item.is_active)
            : [],
          currencies: currencies.success ? currencies.data : [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <BrowserRouter>
      <Header navigation={data.navigation} config={data.configuration} />
<Routes>
          <Route path="/" element={
            <>
              <Banner sliderImages={data.sliderImages} config={data.configuration} />
              <About pages={data.pages} config={data.configuration} />
              <Menu config={data.configuration} />
              <Chefs chefs={data.chefs} config={data.configuration} />
              <Reservation contactItems={data.contactItems} config={data.configuration} />
            </>
          } />
          <Route 
             path="/:slug" 
             element={<DynamicPage />} 
          />
      </Routes>
      <Footer config={data.configuration} />
    </BrowserRouter>
  );
}

export default App;
