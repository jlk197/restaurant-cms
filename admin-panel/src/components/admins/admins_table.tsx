import { useCallback, useEffect, useImperativeHandle, forwardRef } from "react";
import administratorService from "../../services/administratorService";
import Loader from "../Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TrashBinIcon } from "../../icons";
import { User } from "../../models/user";
import { useApi } from "../../hooks/useApi";

export interface AdminsTableRef {
  refresh: () => void;
}

const AdminsTable = forwardRef<AdminsTableRef>(function AdminsTable(_, ref) {
  const {
    data: users,
    isLoading,
    error,
    execute: fetchUsers,
    setData: setUsers,
  } = useApi<User[]>(
    useCallback(() => administratorService.getAll(), []),
    "Cannot get administrators"
  );

  useImperativeHandle(
    ref,
    () => ({
      refresh: fetchUsers,
    }),
    [fetchUsers]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (id: number) => {
    const response = await administratorService.delete(id);
    if (response.success) {
      setUsers((prev) => prev?.filter((user) => user.id !== id) ?? null);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

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
                    Name
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Surname
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white">
                      {user.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white">
                      {user.surname}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-red-500 text-end text-theme-sm dark:text-red-500 pr-6">
                      <button onClick={() => deleteUser(user.id)}>
                        <TrashBinIcon />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdminsTable;
