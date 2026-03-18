const initialState = {
    data: null,
    loading: false,
    mutationLoading: false,
    error: null,
}

export const carouselReducer = (state = initialState, action) => {
    switch (action.type) {
        case "CAROUSEL_DATA_LOADING":
            return { ...state, loading: true, error: null };
        case "CAROUSEL_DATA_MUTATION_LOADING":
            return { ...state, mutationLoading: true, error: null };
        case "CAROUSEL_DATA_SUCCESS":
            return { ...state, loading: false, data: action.payload };
        case "CAROUSEL_DATA_CREATE_SUCCESS":
            return { 
                ...state, 
                mutationLoading: false, 
                data: state.data ? { 
                    ...state.data, 
                    data: {
                        ...state.data.data,
                        carousel: [action.payload.data, ...(state.data.data?.carousel || [])] 
                    }
                } : null
            };
        case "CAROUSEL_DATA_DELETE_SUCCESS":
            return { 
                ...state, 
                mutationLoading: false, 
                data: state.data ? { 
                    ...state.data, 
                    data: {
                        ...state.data.data,
                        carousel: (state.data.data?.carousel || []).filter(c => (c._id || c.id) !== action.payload) 
                    }
                } : null
            };
        case "CAROUSEL_DATA_UPDATE":
            return {
                ...state,
                data: state.data ? {
                    ...state.data,
                    data: {
                        ...state.data.data,
                        carousel: (state.data.data?.carousel || []).map(c => 
                            (c._id || c.id) === action.payload.carouselId 
                            ? { ...c, ...action.payload.data } 
                            : c
                        )
                    }
                } : null
            };
        case "CAROUSEL_DATA_UPDATE_SUCCESS":
            return {
                ...state,
                mutationLoading: false,
                data: state.data ? {
                    ...state.data,
                    data: {
                        ...state.data.data,
                        carousel: (state.data.data?.carousel || []).map(c => 
                            (c._id || c.id) === (action.payload._id || action.payload.id) ? action.payload : c
                        )
                    }
                } : null
            };
        case "CAROUSEL_DATA_ERROR":
            return { ...state, loading: false, mutationLoading: false, error: action.payload };
        default:
            return state;
    }
}