import { useState } from "react";
import { Switch } from "components/ui";
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"
import { useDispatch, useSelector } from 'react-redux';
import { deleteCarouselData, updateCarouselData } from 'redux/actions/carouselAction';
import { toast } from "sonner";
import { ConfirmModal } from 'components/shared/ConfirmModal';
import { EllipsisVerticalIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline"
import CarouselModal from './CarouselModal';

export function CarouselTableRow({ carousel, index }) {
    const dispatch = useDispatch()
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { mutationLoading } = useSelector((state) => state.carousel)
    const [formData, setFormData] = useState({
        title: carousel.title,
        description: carousel.description,
        link: carousel.link,
        isActive: carousel.isActive,
        image: carousel.image
    });

    // Sync formData with props
    // useEffect(() => {
    //     setFormData({
    //         title: carousel.title,
    //         description: carousel.description,
    //         link: carousel.link,
    //         isActive: carousel.isActive,
    //         image: carousel.image
    //     });
    // }, [carousel]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: carousel._id || carousel.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : "auto",
        position: 'relative',
    }

    const handleEditCarousel = async () => {
        const res = await dispatch(updateCarouselData(carousel._id || carousel.id, formData));
        // console.log(formData, "formData edit carousel");
        if (res?.success) {
            toast.success(res.message);
            setShowEditModal(false);
        } else {
            toast.error(res?.message || "Failed to update carousel item");
        }
    }

    // delete carousel
    const handleDeleteCarousel = async () => {
        setDeleteLoading(true);
        const res = await dispatch(deleteCarouselData(carousel._id || carousel.id));
        setDeleteLoading(false);
        if (res?.success) {
            toast.success(res.message);
            setShowDeleteModal(false);
        } else {
            toast.error(res?.message || "Failed to delete carousel item");
        }
    };

    const handleStatusChange = async (checked) => {
        const res = await dispatch(updateCarouselData(carousel._id || carousel.id, { isActive: checked }));
        if (res?.success) {
            toast.success(res.message);
        } else {
            toast.error(res?.message || "Failed to update status");
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, display: 'flex', width: '100%' }} className="hover:bg-gray-50 dark:hover:bg-dark-800/50 flex items-center w-full border-b border-gray-100 dark:border-dark-700/50">
            <div className="w-10 sm:w-16 p-2 sm:p-4 text-center" onClick={(e) => e.stopPropagation()}>
                <div
                    className="inline-flex -space-x-4 text-gray-400 hover:text-primary-500 transition-colors opacity-100 cursor-grab active:cursor-grabbing p-1 sm:p-2"
                    {...attributes}
                    {...listeners}
                >
                    <EllipsisVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                    <EllipsisVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                </div>
            </div>
            <div className="w-12 sm:w-16 p-4 text-center text-sm text-gray-500">{index}</div>

            <div className="w-16 sm:w-24 p-2 sm:p-4 text-center">
                <div className="size-8 sm:size-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-800 shrink-0 mx-auto border border-gray-100 dark:border-dark-700">
                    {carousel.image ? (
                        <img
                            src={carousel.image}
                            alt={carousel.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[10px] text-gray-400">No Image</div>
                    )}
                </div>
            </div>

            <div className="flex-1 p-2 sm:p-4 font-semibold text-gray-800 dark:text-gray-200 truncate min-w-[100px] text-xs sm:text-base">{carousel.title}</div>

            <div className="flex-2 p-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{carousel.description}</div>

            <div className="w-32 p-4 text-center text-sm text-gray-500">{carousel.createdAt ? new Date(carousel.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : 'N/A'}</div>

            <div className="w-24 sm:w-32 p-2 sm:p-4 text-center">
                <Switch
                    variant="outlined"
                    checked={carousel.isActive}
                    label={carousel.isActive ? "Active" : "Inactive"}
                    onChange={(e) => handleStatusChange(e.target.checked)}
                    size="sm"
                />
            </div>

            <div className="w-16 sm:w-24 p-2 sm:p-4 text-center">
                <PencilSquareIcon className="size-4 sm:size-6 cursor-pointer text-primary-400" onClick={() => setShowEditModal(true)} />
            </div>

            <div className="w-16 sm:w-24 p-2 sm:p-4 text-center">
                <TrashIcon className="size-4 sm:size-6 cursor-pointer text-error" onClick={() => setShowDeleteModal(true)} />
            </div>


            <ConfirmModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onOk={handleDeleteCarousel}
                confirmLoading={deleteLoading}
                state="pending"
                messages={{
                    pending: {
                        title: "Delete Carousel Item",
                        description: `Are you sure you want to delete "${carousel.title}"? This action cannot be undone.`,
                        actionText: "Delete",
                    }
                }}
            />

            <CarouselModal
                title="Edit Carousel Item"
                confirmText="Update"
                showModal={showEditModal}
                setShowModal={setShowEditModal}
                handleCreateCarousel={handleEditCarousel}
                createLoading={mutationLoading}
                formData={formData}
                setFormData={setFormData}
            />
        </div>
    )
}
