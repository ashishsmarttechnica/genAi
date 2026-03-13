import PromptCard from './PromptCard'
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { getPromptAction, updatePromptAction } from 'redux/actions/promptAction'
// import {
//     Pagination,
//     PaginationItems,
//     PaginationNext,
//     PaginationPrevious,
// } from "components/ui";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { toast } from "sonner";
import useInfiniteScroll from 'hooks/useInfiniteScroll';

export default function PromptList() {

    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()
    const categoryId = searchParams.get('categoryId') || ''

    const [page, setPage] = useState(1)
    const { cache, loading, loadingMore, error } = useSelector((state) => state.prompt || { cache: {}, loading: false, loadingMore: false, error: null })

    // Derive the active dataset from cache dictionary
    const cacheKey = categoryId || 'ALL';
    const promptsData = cache[cacheKey];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        }),
        useSensor(KeyboardSensor)
    )

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            let movedCategoryId = null;
            let currentPrompts = [];

            // Find the category that contains the dragged prompt
            for (const category of promptsData.categories) {
                const hasPrompt = category.prompts.some(p => (p._id || p.id) === active.id);
                if (hasPrompt) {
                    movedCategoryId = category._id || category.id;
                    currentPrompts = category.prompts;
                    break;
                }
            }

            if (categoryId) {
                const oldIndex = currentPrompts.findIndex((p) => (p._id || p.id) === active.id);
                const newIndex = currentPrompts.findIndex((p) => (p._id || p.id) === over.id);

                if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                    // Actual database index (jaise 55, 118 etc)
                    const targetDbIndex = currentPrompts[newIndex]?.index;

                    dispatch(updatePromptAction(movedCategoryId, active.id, newIndex, targetDbIndex, cacheKey));
                    toast.success("prompt updated successfully");
                } else {
                    toast.error("prompt not updated");
                }
            }
        }
    };

    useEffect(() => {
        // Since Redux now maintains a dictionary `cache[categoryId]`, 
        // we only fetch if `promptsData` is completely undefined for this key.
        if (!promptsData && !loading) {
            setPage(1);
            const initialLimit = categoryId ? 10 : 1;
            dispatch(getPromptAction(1, initialLimit, "", categoryId, false));
        }
        else if (promptsData && promptsData.pagination) {
            // Restore actual page tracking when coming from cache
            setPage(promptsData.pagination.page);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId, promptsData, dispatch])

    const handleLoadMore = useCallback(() => {
        const nextPage = page + 1
        setPage(nextPage)

        // Infinite scroll pe bhi dynamic limit
        const scrollLimit = categoryId ? 10 : 1;
        dispatch(getPromptAction(nextPage, scrollLimit, "", categoryId, true))
    }, [page, categoryId, dispatch])

    const lastElementRef = useInfiniteScroll({
        loading: loading || loadingMore,
        hasMore: promptsData?.pagination?.page < promptsData?.pagination?.pages,
        onLoadMore: handleLoadMore
    })

    return (
        <div className="flex flex-col gap-6 w-full mx-auto relative mb-10">
            {
                loading ? (
                    <div className='flex justify-center items-center h-full min-h-[300px]'>
                        <div className='animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent'></div>
                    </div>
                ) : error ? (
                    <div className='flex justify-center items-center h-full min-h-[300px]'>
                        <p className='text-red-500 font-medium'>{error}</p>
                    </div>
                ) : promptsData?.categories && promptsData.categories.length > 0 ? (

                    <>
                        {/* Premium Sticky Header matching Navbar styling */}
                        <div className='sticky top-16.25 z-20 mb-8 py-4 px-5 sm:px-6 backdrop-blur-sm backdrop-saturate-150 bg-white/80 dark:bg-dark-900/80 border-b border-gray-200 dark:border-dark-600 flex items-center justify-between transition-all'>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-8 w-2 sm:h-10 sm:w-2.5 bg-linear-to-b from-primary-400 to-primary-600 rounded-full shadow-sm"></div>
                                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white drop-shadow-sm'>
                                    {categoryId && promptsData.categories.length === 1
                                        ? promptsData.categories[0].name
                                        : "All Prompts"
                                    }
                                </h2>
                            </div>
                        </div>

                        <div className='px-4'>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={promptsData.categories.flatMap((category) => (
                                        category.prompts.map((prompt) => (prompt._id || prompt.id))
                                    ))}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className='flex flex-col gap-10'>
                                        {promptsData.categories.map((category) => (
                                            <div
                                                key={category._id || category.id}
                                                className='category-section-observer scroll-mt-24'
                                                data-category-name={category.name}
                                            >
                                                {/* Category Title Header */}
                                                {(!categoryId || promptsData.categories.length > 1) && (
                                                    <div className="mb-5 flex items-center gap-3 border-b border-gray-200 dark:border-dark-700 pb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 border border-primary-200 dark:border-primary-800"></div>
                                                            <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white tracking-wide">
                                                                {category.name}
                                                            </h3>
                                                        </div>
                                                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full border border-primary-100 dark:border-primary-800">
                                                            {category.prompts.length} Prompts
                                                        </span>
                                                    </div>
                                                )}

                                                {category.prompts.length > 0 ? (
                                                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                                                        {category.prompts.map((prompt, idx) => (
                                                            <PromptCard key={prompt._id || prompt.id} prompt={prompt} index={idx} categoryId={categoryId} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-10 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-dark-800/30 rounded-xl border border-dashed border-gray-200 dark:border-dark-700">
                                                        <p className="font-medium text-sm">No prompts available in this category.</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                        {/* {console.log(promptsData, "promptsData")} */}

                        {/* Infinite Scroll Observer Target & Loading State */}
                        <div ref={lastElementRef} className="py-4 w-full flex justify-center">
                            {loadingMore && (
                                <div className='flex items-center justify-center gap-2 text-primary-500'>
                                    <div className='animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent'></div>
                                    <span className="text-sm font-medium">Loading more prompts...</span>
                                </div>
                            )}
                        </div>

                    </ >

                ) : (
                    <div className='flex flex-col justify-center items-center h-full min-h-[300px] text-gray-500 dark:text-gray-400'>
                        <p className="text-lg font-medium">No prompts found</p>
                        {categoryId && <p className="text-sm mt-1">Try selecting a different category</p>}
                    </div>
                )

            }

        </div >
    )
}
