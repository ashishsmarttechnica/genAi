const initialState = {
    cache: {},
    loading: false,
    data: null,
    error: null
}

const usersDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case "USERS_DATA_LOADING":
            return {
                ...state,
                loading: true
            };
        case "USERS_DATA_SUCCESS":
            {
                const { page, limit } = action.payload.data.pagination;
                // The sort parameters are already not included in the cacheKey.
                // The commented line below is not used for cacheKey generation.

                const cacheKey = `page-${page}-limit-${limit}`;
                return {
                    ...state,
                    loading: false,
                    data: action.payload,
                    cache: {
                        ...state.cache,
                        [cacheKey]: action.payload
                    },
                    error: null
                };
            }
        case "USERS_DATA_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload,
                data: null
            };
        default:
            return state;
    }
}


export default usersDataReducer;