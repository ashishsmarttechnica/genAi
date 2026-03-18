import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Button } from "components/ui";
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { toast } from "sonner";
import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getCarouselData, createCarouselData } from 'redux/actions/carouselAction';
import { CarouselTableRow } from './CarouselTableData';
import CarouselModal from './CarouselModal';

export default function CarouselList() {
    const dispatch = useDispatch()
    const { data, loading, mutationLoading } = useSelector((state) => state.carousel)
    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        link: '',
        isActive: true,
        image: null
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

    // handle refresh
    const handleRefresh = async () => {
        const res = await dispatch(getCarouselData(1));
        if (res?.success) {
            toast.success(res.message);
        } else {
            toast.error(res?.message || "Failed to refresh carousel list");
        }
    };

    // handle create
    const handleCreateCarousel = async () => {
        if (!formData.title.trim() || !formData.image) {
            toast.error("Please provide title and image");
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("link", formData.link);
        data.append("isActive", formData.isActive ? "true" : "false");
        data.append("image", formData.image);

        const res = await dispatch(createCarouselData(data));
        if (res?.success) {
            toast.success(res.message);
            setFormData({ title: "", description: "", isActive: true, image: null });
            setShowCreateModal(false);
        } else {
            toast.error(res?.message || "Failed to create carousel item");
        }
    };

    // handle drag for index update
    // const handleDragEnd = async (event) => {
    //     const { active, over } = event;

    //     if (over && active.id !== over.id) {
    //         const carouselList = data?.data?.carousel || [];
    //         const oldIndex = carouselList.findIndex((item) => (item._id || item.id) === active.id);
    //         const newIndex = carouselList.findIndex((item) => (item._id || item.id) === over.id);

    //         if (oldIndex !== newIndex) {
    //             const res = await dispatch(moveCarouselDataAction(active.id, newIndex));
    //             if (res?.success) {
    //                 toast.success(res.message);
    //                 dispatch(getCarouselData(1)); // Refresh to get correct order
    //                 return res;
    //             } else {
    //                 toast.error(res?.message || "Failed to move carousel");
    //             }
    //         } else {
    //             toast.error("Carousel not updated");
    //         }
    //     }
    // };
    // filter data by search
    const filteredData = useMemo(() => {
        return data?.data?.carousel?.filter((item) => {
            if (!search) return true;
            const title = item?.title?.toLowerCase() || "";
            const desc = item?.description?.toLowerCase() || "";
            return title.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
        }) || [];
    }, [data, search]);

    // console.log(filteredData, "carousel data");

    // initial load
    useEffect(() => {
        if (!data && !loading) {
            dispatch(getCarouselData(1));
        }
    }, [dispatch, data]);

    return (
        <>
            <div className="table-toolbar sm:flex items-center justify-between mb-6 px-3">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-100">
                    Carousel Management
                </h2>
                <div className="flex items-center gap-3">
                    <CollapsibleSearch
                        placeholder="Search carousel..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        variant="outlined"
                        className="p-2"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <ArrowPathIcon className={clsx("size-5", loading && "animate-spin")} />
                    </Button>
                    <Button variant="filled" onClick={() => setShowCreateModal(true)}>
                        Add Carousel
                    </Button>
                </div>
            </div>

            <div className='mb-10'>
                {loading ? (
                    <div className='flex justify-center items-center min-h-[300px]'>
                        <div className='animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent'></div>
                    </div>
                ) : filteredData.length > 0 ? (

                    <Card className="overflow-hidden border border-gray-100 dark:border-dark-700 shadow-sm">
                        {/* Responsive Scroll Wrapper */}
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-dark-600">
                            <div className="min-w-[800px] lg:min-w-full">
                                {/* Header */}
                                <div className="flex items-center bg-gray-50/50 dark:bg-dark-800/50 p-3 sm:p-4 border-b border-gray-100 dark:border-dark-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-200">
                                    <div className="w-10 sm:w-16 text-center"></div>
                                    <div className="w-12 sm:w-16 text-center">Index</div>
                                    <div className="w-16 sm:w-24 text-center">Image</div>
                                    <div className="flex-1 min-w-[100px]">Title</div>
                                    <div className="flex-2 ">Description</div>
                                    <div className="w-32 text-center">Created At</div>
                                    <div className="w-24 sm:w-32 text-center">Status</div>
                                    <div className="w-16 sm:w-24 text-center">Edit</div>
                                    <div className="w-16 sm:w-24 text-center">Delete</div>
                                </div>

                                {/* Rows */}
                                <div className="flex flex-col">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                    // onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={filteredData.map(c => c._id || c.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {filteredData.map((item, index) => (
                                                <CarouselTableRow
                                                    key={item._id || item.id}
                                                    carousel={item}
                                                    index={index + 1}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className='flex flex-col justify-center items-center min-h-[400px] bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center'>
                        <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-dark-700/50 flex items-center justify-center mb-4">
                            <MagnifyingGlassIcon className="size-10 text-gray-300" />
                        </div>
                        <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-100'>No Carousel Items</h3>
                        <p className='text-gray-500 dark:text-dark-300 mt-2 max-w-sm'>
                            {search ? `No items found matching "${search}"` : "Start by adding your first carousel item to showcase on the platform."}
                        </p>
                        {!search && (
                            <Button variant="filled" className="mt-6" onClick={() => setShowCreateModal(true)}>
                                Add Item Now
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <CarouselModal
                title="Create New Carousel Item"
                confirmText="Create"
                showModal={showCreateModal}
                setShowModal={setShowCreateModal}
                handleCreateCarousel={handleCreateCarousel}
                createLoading={mutationLoading}
                formData={formData}
                setFormData={setFormData}
            />

        </>
    )
}
