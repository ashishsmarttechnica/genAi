const initialState = {
    count: "",
    loading: false,
    error: null
}

export const countReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GET_COUNT":
            return {
                ...state,
                count: action.payload,
                loading: false,
                error: null
            }
        case "GET_COUNT_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        default:
            return state
    }
}