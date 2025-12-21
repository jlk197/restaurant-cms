import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import navigationService from "../../services/navigationService";
import Loader from "../Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TrashBinIcon, PencilIcon } from "../../icons";
import { Navigation } from "../../models/navigation";
import { useApi } from "../../hooks/useApi";

export interface NavigationTableRef {
  refresh: () => void;
}

interface NavigationTableProps {
  onEdit?: (navigation: Navigation) => void;
}

const NavigationTable = forwardRef<NavigationTableRef, NavigationTableProps>(
  function NavigationTable({ onEdit }, ref) {
    const {
      data: navigations,
      isLoading,
      error,
      execute: fetchNavigations,
      setData: setNavigations,
    } = useApi<Navigation[]>(
      useCallback(() => navigationService.getAll(), []),
      "Cannot get navigation items"
    );

    useImperativeHandle(
      ref,
      () => ({
        refresh: fetchNavigations,
      }),
      [fetchNavigations]
    );

    useEffect(() => {
      fetchNavigations();
    }, [fetchNavigations]);

    const deleteNavigation = async (id: number) => {
      const response = await navigationService.delete(id);
      if (response.success) {
        setNavigations((prev) => prev?.filter((nav) => nav.id !== id) ?? null);
      }
    };

    if (isLoading) return <Loader />;

    if (error) {
      return <div className="text-red-500">Error: {error}</div>;
    }

    // Organize navigations into parent-child structure
    const topLevelNavs = navigations?.filter((nav) => !nav.navigation_id) || [];

    // Recursive function to render navigation with all its children
    const renderNavWithChildren = (
      nav: Navigation,
      level: number = 0
    ): React.ReactNode[] => {
      const children =
        navigations?.filter((child) => child.navigation_id === nav.id) || [];

      return [
        <TableRow key={nav.id}>
          <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white">
            {nav.position}
          </TableCell>
          <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white">
            <div className="flex items-center gap-1">
              {level > 0 && (
                <span
                  className="text-gray-400 dark:text-gray-500"
                  style={{ marginLeft: `${level * 16}px` }}
                >
                  {"└─ "}
                </span>
              )}
              <span className={level > 0 ? "text-sm" : ""}>{nav.title}</span>
            </div>
          </TableCell>
          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
            {nav.url}
          </TableCell>
          <TableCell className="px-4 py-3 text-start text-theme-sm">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                nav.link_type === "internal"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : nav.link_type === "external"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              }`}
            >
              {nav.link_type === "internal" && "📄"}
              {nav.link_type === "external" && "🔗"}
              {nav.link_type === "anchor" && "⚓"}
              {nav.link_type === "internal"
                ? "Internal"
                : nav.link_type === "external"
                ? "External"
                : "Anchor"}
            </span>
          </TableCell>
          <TableCell className="px-4 py-3 text-start text-theme-sm">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                nav.is_active
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {nav.is_active ? "Active" : "Inactive"}
            </span>
          </TableCell>
          <TableCell className="text-end pr-6">
            <div className="flex justify-end gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(nav)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <PencilIcon />
                </button>
              )}
              <button
                onClick={() => deleteNavigation(nav.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <TrashBinIcon />
              </button>
            </div>
          </TableCell>
        </TableRow>,
        // Recursively render children
        ...children.flatMap((child) => renderNavWithChildren(child, level + 1)),
      ];
    };

    return (
      <div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1102px]">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Position
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Title
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      URL
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Link Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {topLevelNavs.flatMap((nav) => renderNavWithChildren(nav, 0))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default NavigationTable;
