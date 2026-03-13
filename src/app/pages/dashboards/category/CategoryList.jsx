import { useEffect, useState } from 'react'
// import { CategoryTableRow } from './CategoryTable'
import { useDispatch, useSelector } from 'react-redux'
import { getCategoryDataAction, updateCategoryDataAction } from 'redux/actions/categoryDataAction'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from "components/ui";
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
// import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import ListComponent from 'app/pages/dashboards/category/ListComponent';
import { TableSortIcon } from "components/shared/table/TableSortIcon";


export default function CategoryList() {
  const dispatch = useDispatch()
  const { data, loading, error } = useSelector((state) => state.categoryData)
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    column: "index",
    order: "asc"
  });

  // sensors for dnd
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor)
  )

  // handle drag for index update
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = data.categories.findIndex((item) => (item._id || item.id) === active.id);
      const newIndex = data.categories.findIndex((item) => (item._id || item.id) === over.id);


      if (oldIndex !== newIndex) {
        dispatch(updateCategoryDataAction(active.id, newIndex));
        toast.success("Category updated successfully");
      } else {
        toast.error("Category not updated");
      }
    }
  };

  // handle sorting
  const handleSort = (column) => {
    let newOrder = "asc";

    if (sortConfig.column === column) {
      if (sortConfig.order === "asc") newOrder = "desc";
      else if (sortConfig.order === "desc") newOrder = "";
      else newOrder = "asc";
    }

    setSortConfig({ column, order: newOrder });

    dispatch(getCategoryDataAction(
      1, 10,
      column === "index" ? newOrder : "",
      column === "name" ? newOrder : "",
      column === "createdAt" ? newOrder : "",
      column === "promptCount" ? newOrder : "",
    ))
  }

  // filter data by search
  const filtterData = data?.categories?.filter((item) => {
    if (!search) return true;
    const itemName = item?.name?.toLowerCase() || "";
    return itemName.includes(search.toLowerCase());
  }) || [];


  // use effect for initial data load
  useEffect(() => {
    if (!data && !loading) {
      dispatch(getCategoryDataAction(1, 10, "", ""))
    }
  }, [data, loading, dispatch])

  return (
    <>
      {/* Search Bar */}
      <div className="table-toolbar flex items-center justify-between mb-4 px-5">
        <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Category List
        </h2>
        <div className="flex">
          <CollapsibleSearch
            placeholder="Search here..."
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* categoty list */}
      <div className='mb-10'>
        {loading ? (
          <div className='flex justify-center items-center min-h-[300px]'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent'></div>
          </div>
        ) : error ? (
          <div className='flex justify-center items-center min-h-[300px]'>
            <p className='text-red-500'>{error}</p>
          </div>
        ) : filtterData && filtterData.length > 0 ? (
          <>
            <Card className="relative overflow-visible">
              {/* Professional Sticky Header */}
              <div className="flex items-center bg-gray-50/80 dark:bg-dark-800/80 backdrop-blur-md sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-dark-700 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-white" >
                <div className="w-26 text-center"></div>
                <div className="flex-1 font-semibold">index
                  <button
                    onClick={() => handleSort("index")}
                    className="ml-2"
                  >
                    <TableSortIcon sorted={sortConfig.column === "index" && sortConfig.order ? sortConfig.order : false} />
                  </button>
                </div>
                <div className="flex-1 font-semibold">Category Name
                  <button
                    onClick={() => handleSort("name")}
                    className="ml-2"
                  >
                    <TableSortIcon sorted={sortConfig.column === "name" && sortConfig.order ? sortConfig.order : false} />
                  </button>
                </div>
                <div className="flex-1 font-semibold">Created Date
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="ml-2"
                  >
                    <TableSortIcon sorted={sortConfig.column === "createdAt" && sortConfig.order ? sortConfig.order : false} />
                  </button>
                </div>
                <div className="flex-1 font-semibold">Total Prompt
                  <button
                    onClick={() => handleSort("promptCount")}
                    className="ml-2"
                  >
                    <TableSortIcon sorted={sortConfig.column === "promptCount" && sortConfig.order ? sortConfig.order : false} />
                  </button>
                </div>
                <div className="flex-1 font-semibold">Action</div>
              </div >
              <div className="table-wrapper min-w-full overflow-x-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filtterData.map(c => c._id || c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ListComponent categories={filtterData} />
                  </SortableContext>
                </DndContext>
              </div>
            </Card>

          </>
        ) : (
          <div className='col-span-full flex flex-col justify-center items-center min-h-[300px] gap-3 text-center'>
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 flex items-center justify-center mb-2">
              <MagnifyingGlassIcon className="size-8 text-gray-400" />
            </div>
            <p className='text-xl font-medium text-gray-800 dark:text-gray-200'>No Category Found</p>
            <p className='text-gray-500 dark:text-dark-200'>We could not find any category matching.</p>
          </div>
        )
        }
      </div >
    </>
  )
}
