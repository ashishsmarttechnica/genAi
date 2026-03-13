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
                const { nameOrder, emailOrder, createdAtOrder } = action.payload.sort || {};

                const cacheKey = `page-${page}-limit-${limit}-sort-${nameOrder || ''}-${emailOrder || ''}-${createdAtOrder || ''}`;
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