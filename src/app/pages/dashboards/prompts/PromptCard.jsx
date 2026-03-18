import { useState, memo } from 'react'
import { Card } from 'components/ui/Card'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EllipsisVerticalIcon, Square2StackIcon, CheckIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline"
import { Switch } from "components/ui";
import { useDispatch } from 'react-redux';
import { updatePromptAction } from 'redux/actions/promptAction';
import { toast } from "sonner";

const PromptCard = memo(function PromptCard({ prompt, index, categoryId, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false)
  const dispatch = useDispatch()

  // dnd kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: prompt._id || prompt.id })
  
  // style for dnd kit
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto"
  }

  // status change
  const handleStatusChange = async (checked) => {
    const response = await dispatch(updatePromptAction(prompt._id || prompt.id, { ...prompt, isActive: checked }, categoryId));
    if (response?.success) {
      toast.success("Status updated successfully");
    } else {
      toast.error("Failed to update status");
    }
  }
  // console.log(prompt, "prompt");

  // copy prompt
  const handleCopy = () => {
    if (prompt?.title && prompt?.readyMatePrompt) {
      navigator.clipboard.writeText(prompt.title + "\n" + prompt.readyMatePrompt);
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
      toast.success("Prompt copied to clipboard");
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-lg transition-all duration-300 relative overflow-hidden group  border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 rounded-2xl">
        <div className='grid grid-cols-1 md:grid-cols-12 gap-0 relative'>

          {categoryId && (
            <div
              className="absolute right-3 top-3 flex -space-x-4 text-gray-400 hover:text-primary-500 transition-colors opacity-100 cursor-grab active:cursor-grabbing z-10 p-2"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()} // Prevent card click when dragging
            >
              <EllipsisVerticalIcon className="w-5 h-5 pointer-events-none" />
              <EllipsisVerticalIcon className="w-5 h-5 pointer-events-none" />
            </div>
          )}

          <div
            onClick={handleCopy}
            className={` absolute ${categoryId ? "right-10" : "right-3"} top-3 flex -space-x-4 text-gray-400 active:text-primary-500 transition-colors opacity-100 cursor-pointer active:scale-95 z-10 p-2`}>
            {copied ? (
              <CheckIcon className="size-5 text-success" />
            ) : (
              <Square2StackIcon className="size-5" />
            )}
          </div>


          {/* Left Column - Image (Spans 4 columns on md screens) */}
          <div className='md:col-span-4 lg:col-span-3 relative h-full overflow-hidden'>
            <img
              src={prompt.thumbnail}
              alt={prompt.title}
              loading='lazy'
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out bg-gray-50 dark:bg-dark-900"
            />
            {/* Overlay gradient for aesthetics */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Right Column - Content (Spans 8 columns on md screens) */}
          <div className='md:col-span-8 lg:col-span-9 p-6 flex flex-col justify-center gap-3'>
            <div className="flex justify-between items-start gap-4">
              <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-primary-500 transition-colors'>
                {prompt.title}
              </h3>
            </div>

            <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed'>
              {prompt.readyMatePrompt || prompt.description}
            </p>

            <div className='flex items-center gap-4 justify-between'>
              <Switch variant="outlined" checked={prompt.isActive} label={prompt.isActive ? "Active" : "Inactive"} onChange={(e) => handleStatusChange(e.target.checked)} />
              <div className="flex">
                <div
                  onClick={onDelete}
                  className="top-3 flex -space-x-4 text-gray-400 active:text-primary-500 transition-colors opacity-100 cursor-pointer active:scale-95 z-10 p-2">
                  <TrashIcon className="size-6 cursor-pointer text-error" />
                </div>
                <div
                  onClick={onEdit}
                  className="top-3 flex -space-x-4 text-gray-400 active:text-primary-500 transition-colors opacity-100 cursor-pointer active:scale-95 z-10 p-2">
                  <PencilSquareIcon className="size-6 cursor-pointer text-primary-400" />
                </div>
              </div>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-2 mt-auto'>
              {prompt.categories?.map((c, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full dark:bg-primary-500/10 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20"
                >
                  category : {c.name}
                </span>
              ))}
              <p>index : {index + 1}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
});

export default PromptCard;
