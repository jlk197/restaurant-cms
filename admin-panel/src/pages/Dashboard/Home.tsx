import PageMeta from "../../components/common/PageMeta";
import { Link } from 'react-router-dom';

const menuTiles = [
  {
    title: "Chef Page",
    description: "Manage informations about all the chefs",
    path: "/chef", 
    icon: (""
    ),
    color: "text-primary",
  },
  {
    title: "Contact",
    description: "Edit contact data",
    path: "/contact",
    icon: (""
    ),
    color: "text-green-500",
  },
  {
    title: "Configuration",
    description: "Edit site configuration",
    path: "/configuration",
    icon: (""),
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

      {/* Nagłówek Dashboardu */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Witaj w Panelu Restauracji
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><span className="font-medium">Admin /</span></li>
            <li className="font-medium text-primary">Dashboard</li>
          </ol>
        </nav>
      </div>

      {/* Grid Layout dla Kafelków */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
        {menuTiles.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className="group relative flex flex-col items-start justify-between rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default transition-all hover:border-primary hover:shadow-lg dark:border-strokedark dark:bg-boxdark dark:hover:border-primary"
          >
            {/* Ikona w kółku */}
            <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 ${item.color} mb-4 group-hover:bg-opacity-90`}>
              {item.icon}
            </div>

            {/* Treść tekstowa */}
            <div className="mt-auto">
              <h4 className="text-xl font-bold text-black dark:text-white group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="mt-2 text-sm font-medium text-bodydark2">
                {item.description}
              </p>
            </div>
            
            {/* Strzałka akcji (pojawia się po najechaniu) */}
            <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}