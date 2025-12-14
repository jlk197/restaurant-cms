import PageMeta from "../../components/common/PageMeta";

const ChefPage = () => {
  return (
    <>
      <PageMeta title="Szef Kuchni" description="Zarządzanie kucharzami" />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Szef Kuchni</h2>
        <p>Tu będzie panel zarządzania szefem kuchni.</p>
      </div>
    </>
  );
};

export default ChefPage;
