import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import type { Configuration } from "../../models/configuration";
import configurationService from "../../services/configurationService";
import ConfigForm from "../../components/configuration/config_form";
import { useApi } from "../../hooks/useApi";
import Loader from "../../components/Loader";

export default function Configuration() {
  const [isEdit, setIsEdit] = useState(false);
  const [editedConfiguration, setEditedConfiguration] = useState<
    Configuration[]
  >([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const {
    data: configurations,
    isLoading,
    error,
    execute: fetchConfigurations,
    setData: setConfigurations,
  } = useApi<Configuration[]>(
    useCallback(() => configurationService.getAll(), []),
    "Cannot get configuration"
  );

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  const exitEditMode = () => {
    setIsEdit(false);
    setEditedConfiguration(configurations);
    setSaveSuccess(false);
    setSaveError("");
  };

  const toggleEditMode = () => {
    setIsEdit(true);
    setEditedConfiguration(configurations);
    setSaveSuccess(false);
    setSaveError("");
  };

  const handleChange = (index: number, key: string, value: string) => {
    setEditedConfiguration((prevConfigurations) => {
      if (!prevConfigurations) return null;
      const newConfigurations = [...prevConfigurations];
      newConfigurations[index] = { ...newConfigurations[index], [key]: value };
      return newConfigurations;
    });
  };

  const savehandler = async () => {
    if (!configurations) return;
    setSaveSuccess(false);
    setSaveError("");

    try {
      const response = await configurationService.updateAll(
        editedConfiguration
      );
      if (response.success) {
        setSaveSuccess(true);
        setIsEdit(false);
        await fetchConfigurations();
      } else {
        setSaveError(response.error || "Failed to save configurations");
      }
    } catch (err) {
      setSaveError("Failed to save configurations");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 p-4 text-sm text-green-600 bg-green-50 rounded-xl border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          Configuration saved successfully!
        </div>
      )}

      {saveError && (
        <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {saveError}
        </div>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        <div className="flex flex-row justify-between">
          <h3 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Configuration
          </h3>

          {isEdit ? (
            <div className="flex flex-row gap-4">
              <button
                onClick={exitEditMode}
                className="hover:opacity-70 transition-opacity border border-blue-500 rounded-lg px-7"
              >
                <span className="text-lg font-bold text-blue-500">Cancel</span>
              </button>
              <button
                onClick={savehandler}
                className="hover:opacity-70 transition-opacity border border-green-500 rounded-lg px-7"
              >
                <span className="text-lg font-bold text-green-500">Save</span>
              </button>
            </div>
          ) : (
            <button
              onClick={toggleEditMode}
              className="hover:opacity-70 transition-opacity border border-blue-500 rounded-lg px-7"
            >
              <span className="text-lg font-bold text-blue-500"> Edit</span>
            </button>
          )}
        </div>
        <div className="space-y-6">
          {configurations && (
            <ConfigForm
              configurations={isEdit ? editedConfiguration : configurations}
              isEditMode={isEdit}
              onChange={handleChange}
            />
          )}
        </div>
      </div>
    </>
  );
}
