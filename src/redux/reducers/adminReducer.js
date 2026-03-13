const InitialState = {
    loading: false,
    error: null
}

const AdminReducer = (state = InitialState, action) => {
    switch (action.type) {
        case "LOGIN_SUCCESS":
            return {
                ...state,
                admin: action.payload,
                loading: true,
                error: null
            };
        case "LOGIN_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
}

export default AdminReducer;