import { arrayMove } from '@dnd-kit/sortable';

const initialState = {
    data: null,
    loading: false,
    mutationLoading: false,
    loadingMore: false,
    error: null,
    limit: 10,
}

const categoryDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case "CATEGORY_DATA_LOADING":
            return {
                ...state,
                loading: true,
                error: null
            }

        case "CATEGORY_DATA_MUTATION_LOADING":
            return {
                ...state,
                mutationLoading: true,
                error: null
            }

        case "CATEGORY_DATA_SUCCESS":
            return {
                ...state,
                loading: false,
                data: action.payload.data,
                limit: action.payload.limit,
                error: null
            }

        case "CATEGORY_DATA_CREATE": {
            const newCategory = action.payload.data?.data || action.payload.data?.category || action.payload.data;
            
            if (!newCategory || typeof newCategory !== 'object' || (!newCategory._id && !newCategory.id)) {
                console.error("Invalid category data received in CATEGORY_DATA_CREATE:", action.payload);
                return { ...state, mutationLoading: false };
            }

            return {
                ...state,
                mutationLoading: false,
                data: state.data ? {
                    ...state.data,
                    categories: [newCategory, ...(state.data.categories || [])],
                    // Increment total count if present
                    total: state.data.total ? state.data.total + 1 : state.data.categories?.length + 1
                } : {
                    categories: [newCategory],
                    total: 1
                },
                error: null
            }
        }

        case "CATEGORY_DATA_DELETE":
            return {
                ...state,
                mutationLoading: false,
                data: {
                    ...state.data,
                    categories: state.data.categories.filter((c) => (c._id || c.id) !== action.payload.categoryId)
                },
                error: null
            }

        case "CATEGORY_DATA_LOAD_MORE_SUCCESS": {
            const existingCategories = [...(state.data?.categories || [])];
            const newCategories = action.payload.data?.categories || [];

            // Add only unique categories to avoid duplicate keys in React
            newCategories.forEach(newCat => {
                const isDuplicate = existingCategories.some(c => (c._id || c.id) === (newCat._id || newCat.id));
                if (!isDuplicate) {
                    existingCategories.push(newCat);
                }
            });

            return {
                ...state,
                loadingMore: false,
                data: {
                    ...state.data,
                    ...action.payload.data,
                    categories: existingCategories
                },
                error: null
            };
        }

        case "CATEGORY_DATA_MOVE": {
            const { categoryId, toIndex } = action.payload;
            const currentCategories = [...state.data.categories];

            const fromIndex = currentCategories.findIndex(c => c._id === categoryId || c.id === categoryId);

            if (fromIndex === -1) return state

            // arrayMove automatically purani jagah se item nikal kar nayi jagah daalta hai Bina duplicate kiye
            const reorderedCategories = arrayMove(currentCategories, fromIndex, toIndex);

            // update all item index 
            const updatedCategories = reorderedCategories.map((item, idx) => ({
                ...item,
                index: idx // new index assign
            }))

            return {
                ...state,
                data: {
                    ...state.data,
                    categories: updatedCategories
                }
            };
        }

        case "CATEGORY_DATA_UPDATE": {
            const { categoryId, isActive } = action.payload;
            const updatedCategories = state.data.categories.map((category) => {
                if (category._id === categoryId || category.id === categoryId) {
                    return { ...category, isActive };
                }
                return category;
            });
            return {
                ...state,
                data: {
                    ...state.data,
                    categories: updatedCategories
                }
            };
        }

        case "CATEGORY_DATA_ERROR":
            return {
                ...state,
                loading: false,
                mutationLoading: false,
                data: action.payload.data || state.data, // Revert back to backup data if provided
                error: action.payload.error || action.payload
            }

        default:
            return state
    }
}

export default categoryDataReducer;
