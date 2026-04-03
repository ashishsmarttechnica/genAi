import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDataAction } from "../../../../redux/actions/usersDataAction";
import { Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PaginationSection } from "../../../../components/shared/table/PaginationSection";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";


export default function UsersList() {
  const dispatch = useDispatch();
  const theadRef = useRef(null);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    column: "name",
    order: ""
  });

  const { data, loading } = useSelector((state) => state.usersData);
  const users = data?.data?.users || [];
  const paginationData = data?.data?.pagination || {};
  const totalPages = paginationData.pages || 1;
  const totalRows = paginationData.total || 0;

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // use effect for initial data load
  useEffect(() => {
    const currentPage = pagination.pageIndex + 1;
    const currentLimit = pagination.pageSize;

    dispatch(getUserDataAction(currentPage, currentLimit));
  }, [pagination.pageIndex, pagination.pageSize, dispatch]);


  // handle sort by column
  const handleSort = (column) => {
    let newOrder = "asc"; // Default to ascending for a new column

    if (sortConfig.column === column) {
      // If the same column is clicked, cycle through orders
      if (sortConfig.order === "asc") {
        newOrder = "desc";
      } else if (sortConfig.order === "desc") {
        newOrder = ""; // Clear sort
      } else {
        newOrder = "asc"; // If no order or invalid, default to asc
      }
    }

    setSortConfig({ column, order: newOrder });
    // Pagination reset on sort
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }


  // filter data by search
  const filterData = useMemo(() => {
    return users?.filter((item) => {
      if (!search) return true;
      const fullName = item?.firstName + " " + item?.lastName;
      return fullName.toLowerCase().includes(search.toLowerCase());
    }) || [];
  }, [users, search]);


  const sortedAndFilteredData = useMemo(() => {
    let result = [...filterData];

    if (sortConfig.column && sortConfig.order) {
      result.sort((a, b) => {
        let valA = a[sortConfig.column];
        let valB = b[sortConfig.column];

        // Custom logic for Name (firstName + lastName)
        if (sortConfig.column === 'name') {
          valA = `${a.firstName} ${a.lastName}`;
          valB = `${b.firstName} ${b.lastName}`;
        }

        // String Comparison (Name, Email)
        if (typeof valA === 'string') {
          return sortConfig.order === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        // Date Comparison (Joined Date)
        if (sortConfig.column === 'createdAt') {
          return sortConfig.order === 'asc'
            ? new Date(valA) - new Date(valB)
            : new Date(valB) - new Date(valA);
        }

        return sortConfig.order === 'asc' ? valA - valB : valB - valA;
      });
    }
    return result;
  }, [filterData, sortConfig]);



  // columns for table
  const columns = useMemo(
    () => [
      {
        accessorKey: "profileImage",
        header: "Profile",
        cell: (info) => (
          <img
            src={info.getValue()}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-dark-600 shadow-sm"
          />
        ),
      },
      {
        id: "name",
        header: "Name",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: (info) => (
          <span className="font-semibold text-gray-800 dark:text-dark-100">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => (
          <span className="text-gray-500 dark:text-dark-200">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: (info) => (
          <span className="capitalize px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-100 dark:border-primary-800 tracking-wide">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined Date",
        cell: (info) => (
          <span className="text-gray-500 dark:text-dark-200">
            {new Date(info.getValue()).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: sortedAndFilteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    rowCount: totalRows,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <>
      {/* Search Bar */}
      <div className="table-toolbar flex items-center justify-between my-4 px-5">
        <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-100">
          User List
        </h2>
        <div className="flex">
          <CollapsibleSearch
            placeholder="Search here..."
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="relative">
        <div className="table-wrapper min-w-full overflow-x-auto h-[calc(100vh-222px)]">
          <Table hoverable className="w-full  text-left rtl:text-right">
            <THead ref={theadRef}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      className="bg-gray-100 font-semibold uppercase text-gray-700 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg py-3 px-4 border-b border-gray-200 dark:border-dark-600"
                    >
                      <div
                        className={header.column.id !== "profileImage" && header.column.id !== "role" ? "flex items-center cursor-pointer select-none" : ""}
                        onClick={() => {
                          if (header.column.id !== "profileImage" && header.column.id !== "role") {
                            handleSort(header.column.id);
                          }
                        }}
                      >
                        <span className="flex gap-2 items-center">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          {(header.column.id !== "profileImage" && header.column.id !== "role") && (
                            <TableSortIcon sorted={sortConfig.column === header.column.id && sortConfig.order ? sortConfig.order : false} />
                          )}
                        </span>
                      </div>
                    </Th>
                  ))}
                </Tr>
              ))}
            </THead>

            <TBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <Tr
                    key={row.id}
                    className="relative border-y border-transparent border-b-gray-100 dark:border-b-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id} className="py-3 px-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : !loading && (
                <Tr>
                  <Td
                    colSpan={columns.length}
                    className="text-center py-10 text-gray-500 dark:text-gray-400"
                  >
                    <div className='col-span-full flex flex-col justify-center items-center min-h-[300px] gap-3 text-center'>
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 flex items-center justify-center mb-2">
                        <MagnifyingGlassIcon className="size-8 text-gray-400" />
                      </div>
                      <p className='text-xl font-medium text-gray-800 dark:text-gray-200'>No User Found</p>
                      <p className='text-gray-500 dark:text-dark-200'>We could not find any user for this Name.</p>
                    </div>
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>
        {users.length > 0 && (
          <div className="p-4 sm:px-5 border-t border-gray-100 dark:border-dark-700">
            <PaginationSection table={table} />
          </div>
        )}
      </Card>
    </>
  );
}
