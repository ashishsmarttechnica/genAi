import { useSortable } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import { useNavigate } from 'react-router-dom'
import { Button } from 'components/ui/Button';

export function CategoryTableRow({ category }) {
    const navigate = useNavigate()

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

            <div className="flex-1 p-4 font-semibold text-center">{category.promptCount}</div>

            <div className="flex-1 p-4 font-semibold">
                <Button variant="filled" onClick={handleClick} className="p-2">View</Button>
            </div>
        </div>
    )
}
