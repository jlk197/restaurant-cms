import PageMeta from "../../components/common/PageMeta";
import { Link } from 'react-router-dom';
import ContentPage from "./ContentPage";

const menuTiles = [
  {
    title: "Chef Page",
    description: "Manage informations about all the chefs",
    path: "/chef", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.33,18.45v8.59c0,.41,.34,.75,.75,.75h15.13c.41,0,.75-.34,.75-.75v-8.6c1.91-.75,3.27-2.6,3.27-4.77,0-2.83-2.3-5.13-5.13-5.13-.56,0-1.13,.1-1.67,.28-1.2-1.87-3.24-3.01-5.49-3.01s-4.09,1.02-5.31,2.75c-3.06-.27-5.56,2.14-5.56,5.11,0,2.17,1.36,4.02,3.27,4.77Zm1.5,7.84v-1.87h13.63v1.87H7.83Zm13.63-7.48v4.11H7.83v-4.11h13.63ZM8.19,10.05c.18,0,.36,.02,.56,.05,0,0,.01,0,.02,0,1.72,.33,2.97,1.83,2.97,3.57,0,.41,.34,.75,.75,.75s.75-.34,.75-.75c0-2.05-1.23-3.85-3.04-4.67,.94-1.07,2.29-1.7,3.74-1.7,1.91,0,3.64,1.07,4.5,2.79,.09,.18,.25,.31,.43,.38,.19,.06,.39,.05,.57-.04,.52-.26,1.09-.4,1.65-.4,2,0,3.63,1.63,3.63,3.63s-1.63,3.63-3.63,3.63H8.19c-2,0-3.63-1.63-3.63-3.63s1.63-3.63,3.63-3.63Z" />
      </svg>
    ),
    color: "text-green-500",
  },
  {
    title: "Contact",
    description: "Edit contact data",
    path: "/contact",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
    color: "text-green-500",
  },
  {
    title: "Configuration",
    description: "Edit site configuration",
    path: "/configuration",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    color: "text-green-500",
  },
    {
    title: "Menu",
    description: "Edit menu information",
    path: "/menu",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
        <path d="M6.97,30.75H25.03c.41,0,.75-.34,.75-.75V3.89c0-.41-.34-.75-.75-.75h-2.56v-1.14c0-.41-.34-.75-.75-.75s-.75,.34-.75,.75v1.14h-4.22v-1.14c0-.41-.34-.75-.75-.75s-.75,.34-.75,.75v1.14h-4.22v-1.14c0-.41-.34-.75-.75-.75s-.75,.34-.75,.75v1.14h-2.56c-.41,0-.75,.34-.75,.75V30c0,.41,.34,.75,.75,.75Zm.75-26.11h1.81v1.14c0,.41,.34,.75,.75,.75s.75-.34,.75-.75v-1.14h4.22v1.14c0,.41,.34,.75,.75,.75s.75-.34,.75-.75v-1.14h4.22v1.14c0,.41,.34,.75,.75,.75s.75-.34,.75-.75v-1.14h1.81V29.25H7.72V4.64Z"/><path d="M16.86,9.66h-6.57c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75h6.57c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75Z"/><path d="M16.86,16.19h-6.57c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75h6.57c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75Z"/><path d="M16.86,22.73h-6.57c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75h6.57c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75Z"/><path d="M10.28,14.27h3.61c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75h-3.61c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75Z"/><path d="M10.28,21h3.61c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75h-3.61c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75Z"/><path d="M13.89,25.79h-3.61c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75h3.61c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75Z"/>        </svg>
    ),
    color: "text-green-500",
  },
      {
    title: "Page Items",
    description: "Edit page items",
    path: "/page-item",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3 6.75h.008v.008H3V6.75Zm0 5.25h.008v.008H3V12Zm0 5.25h.008v.008H3v-.008Z" />
        </svg>
    ),
    color: "text-green-500",
  },
];

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard Restauracji | Panel Administracyjny"
        description="Zarządzaj treścią swojej restauracji z poziomu panelu głównego."
      />

      {/* Wyśrodkowany Nagłówek z powiększonym tekstem */}
      <div className="mb-10 flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black dark:text-white">
          Welcome in Restaurant Panel
        </h2>
        <nav>
          <ol className="flex items-center gap-2 text-lg">
            <li><span className="font-medium">Admin /</span></li>
            <li className="font-medium text-primary">Dashboard</li>
          </ol>
        </nav>
      </div>

      {/* Grid Layout dla Kafelków */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {menuTiles.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            // Zmieniono rounded-sm na rounded-2xl dla mocnego zaokrąglenia
            className="group relative flex flex-col items-start justify-between rounded-2xl border border-stroke bg-white px-7.5 py-8 shadow-default transition-all hover:border-primary hover:shadow-lg dark:border-strokedark dark:bg-boxdark dark:hover:border-primary"
          >
            {/* Ikona w kółku */}
            <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 ${item.color} mb-6 group-hover:bg-opacity-90`}>
              {item.icon}
            </div>

            {/* Treść tekstowa */}
            <div className="mt-auto">
              <h4 className="text-2xl font-bold text-black dark:text-white group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="mt-2 text-base font-medium text-bodydark2">
                {item.description}
              </p>
            </div>

            {/* Strzałka akcji (pojawia się po najechaniu) */}
            <div className="absolute top-6 right-6 opacity-0 transition-opacity group-hover:opacity-100 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
         <ContentPage />
      </div>

    </>
  );
}
