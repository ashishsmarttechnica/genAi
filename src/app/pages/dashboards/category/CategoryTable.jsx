import { useState } from "react";
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useNavigate } from 'react-router-dom'
import { Button } from 'components/ui/Button';
import { Switch } from "components/ui";
import { useDispatch } from 'react-redux';
import { updateCategoryDataAction, deleteCategory } from 'redux/actions/categoryDataAction';
import { toast } from "sonner";
import { ConfirmModal } from 'components/shared/ConfirmModal';

export function CategoryTableRow({ category }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category._id || category.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : "auto",
        position: 'relative',
    }

    const handleClick = () => {
        navigate(`/dashboards/prompts?categoryId=${category._id || category.id}`);
    }

    const handleDeleteCategory = async () => {
        setDeleteLoading(true);
        const res = await dispatch(deleteCategory(category._id || category.id));
        setDeleteLoading(false);
        if (res?.success) {
            toast.success(res.message);
            setShowDeleteModal(false);
        } else {
            toast.error(res?.message || "Failed to delete category");
        }
    };

    const handleStatusChange = async (checked) => {
        const response = await dispatch(updateCategoryDataAction(category._id || category.id, category.name, checked));
        // console.log(response, "response");
        if (response?.success) {
            toast.success("Status updated successfully");
        } else {
            toast.error("Failed to update status");
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, display: 'flex', width: '100%' }}
            className="hover:bg-gray-50 dark:hover:bg-dark-800/50 items-center"
        >
            <div className="w-16 p-4" onClick={(e) => e.stopPropagation()}>
                <div
                    className="inline-flex -space-x-4 text-gray-400 hover:text-primary-500 transition-colors opacity-100 cursor-grab active:cursor-grabbing p-2"
                    {...attributes}
                    {...listeners}
                >
                    <EllipsisVerticalIcon className="w-5 h-5 pointer-events-none" />
                    <EllipsisVerticalIcon className="w-5 h-5 pointer-events-none" />
                </div>
            </div>
            <div className="w-32 p-4 text-center">{category.index}</div>

            <div className="flex-1 p-4 font-semibold">{category.name}</div>
            <div className="flex-1 p-4 font-semibold text-center">{category.createdAt ? new Date(category.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : 'N/A'}</div>
            <div className="flex-1 p-4 font-semibold text-center">{category.promptCount || 0}</div>

            <div className="flex-1 p-4 font-semibold text-center">
                <Switch variant="outlined" checked={category.isActive} label={category.isActive ? "Active" : "Inactive"} onChange={(e) => handleStatusChange(e.target.checked)} />
            </div>

            <div className="flex-1 p-4 font-semibold text-center">
                <Button variant="filled" onClick={handleClick} className="p-2">View</Button>
            </div>

            <div className="flex-1 p-4 font-semibold text-center">
                <Button variant="filled" color="error" onClick={() => setShowDeleteModal(true)} className="p-2">
                    <TrashIcon className="size-5" />
                </Button>
            </div>

            <ConfirmModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onOk={handleDeleteCategory}
                confirmLoading={deleteLoading}
                state="pending"
                messages={{
                    pending: {
                        title: "Delete Category",
                        description: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
                        actionText: "Delete",
                    }
                }}
            />
        </div>
    )
}
