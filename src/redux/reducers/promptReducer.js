import { arrayMove } from '@dnd-kit/sortable';

const initialState = {
    cache: {}, // Dynamic dictionary caching { "ALL": data, "categoryId_X": data }
    loading: false,
    loadingMore: false,
    error: null,
}

const PromptReducer = (state = initialState, action) => {
    switch (action.type) {
        case "PROMPT_DATA_LOADING":
            return {
                ...state,
                loading: true,
                error: null
            }
        case "PROMPT_DATA_SUCCESS": {
            const cacheKey = action.meta.categoryId || 'ALL';
            return {
                ...state,
                loading: false,
                cache: {
                    ...state.cache,
                    [cacheKey]: {
                        ...action.payload.data,
                        limit: action.payload.limit
                    }
                },
                error: null
            }
        }
        case "PROMPT_DATA_CREATE_LOADING":
            return {
                ...state,
                loading: true,
                error: null
            }
        case "PROMPT_DATA_CREATE_SUCCESS": {
            // const cacheKey = action.meta.categoryId || 'ALL';
            const newPrompt = action.payload.data; // Assuming action.payload.data is the new prompt object

            // We need to update ALL cache entries that might contain this prompt's category
            const updatedCache = { ...state.cache };

            Object.keys(updatedCache).forEach(key => {
                const cacheData = { ...updatedCache[key] };
                if (cacheData.categories) {
                    const categoryIndex = cacheData.categories.findIndex(c =>
                        (c._id || c.id) === (newPrompt.category?._id || newPrompt.category?.id || newPrompt.category || action.meta.categoryId)
                    );

                    if (categoryIndex !== -1) {
                        const updatedCategories = [...cacheData.categories];
                        const category = { ...updatedCategories[categoryIndex] };
                        category.prompts = [newPrompt, ...(category.prompts || [])];
                        updatedCategories[categoryIndex] = category;
                        updatedCache[key] = { ...cacheData, categories: updatedCategories };
                    }
                }
            });


            return {
                ...state,
                loading: false,
                cache: updatedCache,
                error: null
            }
        }
        case "PROMPT_DATA_CREATE_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case "PROMPT_DATA_LOAD_MORE_LOADING":
            return {
                ...state,
                loadingMore: true,
                error: null
            }
        case "PROMPT_DATA_LOAD_MORE_SUCCESS": {
            const cacheKey = action.meta.categoryId || 'ALL';
            const existingData = state.cache[cacheKey] || {};
            const existingCategories = [...(existingData.categories || [])];
            const newCategories = action.payload.data?.categories || [];

            newCategories.forEach(newCat => {
                const existingCatIndex = existingCategories.findIndex(c => (c._id || c.id) === (newCat._id || newCat.id));
                if (existingCatIndex !== -1) {
                    // Category exists, append new prompts avoiding duplicates
                    const existingPrompts = existingCategories[existingCatIndex].prompts;
                    const existingPromptIds = new Set(existingPrompts.map(p => p._id || p.id));

                    const uniqueNewPrompts = newCat.prompts.filter(p => !existingPromptIds.has(p._id || p.id));

                    existingCategories[existingCatIndex] = {
                        ...existingCategories[existingCatIndex],
                        prompts: [...existingPrompts, ...uniqueNewPrompts]
                    };
                } else {
                    existingCategories.push(newCat);
                }
            });

            return {
                ...state,
                loadingMore: false,
                cache: {
                    ...state.cache,
                    [cacheKey]: {
                        ...existingData,
                        ...action.payload.data,
                        categories: existingCategories
                    }
                },
                error: null
            };
        }
        case "PROMPT_DATA_ERROR":
            return {
                ...state,
                loading: false,
                loadingMore: false,
                error: action.payload
            }
        case "PROMPT_DATA_MOVE": {
            const { categoryId, promptId, toIndex, cacheKey: metaCacheKey } = action.payload;
            const cacheKey = metaCacheKey || 'ALL';

            const targetData = state.cache[cacheKey];
            if (!targetData || !targetData.categories) return state;

            // Find the category index
            const categoryIndex = targetData.categories.findIndex(c => (c._id || c.id) === categoryId);
            if (categoryIndex === -1) return state;

            const category = targetData.categories[categoryIndex];
            const currentPrompts = [...(category.prompts || [])];

            // Find index of prompt
            const fromIndex = currentPrompts.findIndex(p => (p._id || p.id) === promptId);
            if (fromIndex === -1) return state;

            // Gather the exact set of backend index numbers currently present in this group
            // [55, 118, 293, 299, 881] in visual order
            const originalSparseIndices = currentPrompts.map(p => p.index);

            // Move prompt in the visual array first (e.g. moving 299 to 293 position)
            const reorderedPrompts = arrayMove(currentPrompts, fromIndex, toIndex);

            // Map those original backend indices back to the freshly ordered elements.
            // This guarantees NO DUPLICATES and NO collision with items outside this list.
            const updatedPrompts = reorderedPrompts.map((item, idx) => ({
                ...item,
                index: originalSparseIndices[idx]
            }));

            // Create new categories array
            const updatedCategories = [...targetData.categories];
            updatedCategories[categoryIndex] = {
                ...category,
                prompts: updatedPrompts
            };

            return {
                ...state,
                cache: {
                    ...state.cache,
                    [cacheKey]: {
                        ...targetData,
                        categories: updatedCategories
                    }
                }
            };
        }
        case "PROMPT_DATA_MOVE_ERROR": {
            const cacheKey = action.payload.cacheKey || 'ALL';
            return {
                ...state,
                cache: {
                    ...state.cache,
                    [cacheKey]: action.payload.data
                }
            };
        }
        case "PROMPT_DATA_UPDATE": {
            const { promptId, isActive, cacheKey: metaCacheKey } = action.payload;
            const cacheKey = metaCacheKey || 'ALL';

            const targetData = state.cache[cacheKey];
            if (!targetData || !targetData.categories) return state;

            const updatedCategories = targetData.categories.map(category => ({
                ...category,
                prompts: category.prompts.map(prompt =>
                    (prompt._id || prompt.id) === promptId
                        ? { ...prompt, isActive }
                        : prompt
                )
            }));

            return {
                ...state,
                cache: {
                    ...state.cache,
                    [cacheKey]: {
                        ...targetData,
                        categories: updatedCategories
                    }
                }
            };
        }
        case "PROMPT_DATA_UPDATE_ERROR": {
            const cacheKey = action.payload.cacheKey || 'ALL';
            return {
                ...state,
                cache: {
                    ...state.cache,
                    [cacheKey]: action.payload.data
                }
            };
        }
        case "PROMPT_DATA_DELETE": {
            const { promptId, cacheKey: metaCacheKey } = action.payload;
            const cacheKey = metaCacheKey || 'ALL';

            const targetData = state.cache[cacheKey];
            if (!targetData || !targetData.categories) return state;

            const updatedCategories = targetData.categories.map(category => ({
                ...category,
                prompts: category.prompts.filter(prompt => (prompt._id || prompt.id) !== promptId)
            }));

            return {
                ...state,
                cache: {
                    ...state.cache,
                    [cacheKey]: {
                        ...targetData,
                        categories: updatedCategories
                    }
                }
            }
        }
        default:
            return state;
    }
}

export default PromptReducer;

