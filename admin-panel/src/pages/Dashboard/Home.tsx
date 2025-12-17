import PageMeta from "../../components/common/PageMeta";
import { Link } from 'react-router-dom';

const menuTiles = [
  {
    title: "Chef Page",
    description: "Manage informations about all the chefs",
    path: "/chef", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    color: "text-primary",
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
          Witaj w Panelu Restauracji
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
    </>
  );
}