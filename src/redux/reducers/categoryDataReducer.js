import { arrayMove } from '@dnd-kit/sortable';

const initialState = {
    data: null,
    loading: false,
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
        case "CATEGORY_DATA_SUCCESS":
            return {
                ...state,
                loading: false,
                data: action.payload.data,
                limit: action.payload.limit,
                error: null
            }
        case "CATEGORY_DATA_LOAD_MORE_LOADING":
            return {
                ...state,
                loadingMore: true,
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
        case "CATEGORY_DATA_MOVE_ERROR":
            return {
                ...state,
                loading: false,
                data: action.payload.data, // Revert back to backup data
                error: "Failed to move category"
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

        default:
            return state
    }
}

export default categoryDataReducer;
