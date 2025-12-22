import { useState, useEffect } from "react";
import Preloader from "./components/Preloader";
import Header from "./components/Header";
import Banner from "./components/Banner";
import About from "./components/About";
import Menu from "./components/Menu";
import Chefs from "./components/Chefs";
import Reservation from "./components/Reservation";
import Offers from "./components/Offers";
import Footer from "./components/Footer";
import apiService from "./api/api_service";

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    configuration: {},
    navigation: [],
    sliderImages: [],
    pages: [],
    menuItems: [],
    chefs: [],
    contactItems: [],
    currencies: [],
  });

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      apiService.getAllConfiguration(),
      apiService.getAllNavigation(),
      apiService.getAllSliderImages(),
      apiService.getAllPages(),
      apiService.getAllMenuItems(),
      apiService.getAllChefs(),
      apiService.getAllContactItems(),
      apiService.getAllCurrencies(),
    ])
      .then(
        ([config, nav, slider, pages, menu, chefs, contact, currencies]) => {
          // Transform configuration array to object
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
            menuItems: menu.success ? menu.data : [],
            chefs: chefs.success ? chefs.data : [],
            contactItems: contact.success
              ? contact.data.filter((item) => item.is_active)
              : [],
            currencies: currencies.success ? currencies.data : [],
          });
          setLoading(false);
        }
      )
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <>
      <Header navigation={data.navigation} />
      <Banner sliderImages={data.sliderImages} config={data.configuration} />
      <About pages={data.pages} />
      <Menu menuItems={data.menuItems} />
      <Chefs chefs={data.chefs} />
      <Reservation contactItems={data.contactItems} />
      <Offers />
      <Footer />
    </>
  );
}

export default App;
