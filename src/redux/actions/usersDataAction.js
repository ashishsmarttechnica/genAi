import axiosClient from "utils/axios";

export const getUserDataAction = (page = 1, limit = 10) => {
    return async (dispatch, getState) => {
        const { cache } = getState().usersData;
        const cacheKey = `page-${page}-limit-${limit}`;

        // Check if we already have the data in store for this page
        if (cache && cache[cacheKey]) {
            dispatch({
                type: "USERS_DATA_SUCCESS",
                payload: cache[cacheKey]
            });
            return {
                success: true,
                message: "User data loaded from cache",
                data: cache[cacheKey],
            };
        }

        dispatch({ type: "USERS_DATA_LOADING" });
        try {
            const res = await axiosClient.get(`/admin/users?page=${page}&limit=${limit}`)
            if (res && res.data && res.data.success) {
                dispatch({
                    type: "USERS_DATA_SUCCESS",
                    payload: res.data
                })
                return {
                    success: true,
                    message: res.data.message || "User data fetched successfully!",
                    data: res.data,
                };
            } else {
                dispatch({ type: "USERS_DATA_ERROR", payload: res.data?.message || "Failed to fetch user data" })
                return {
                    success: false,
                    message: res.data?.message || "Failed to fetch user data"
                };
            }
        } catch (error) {
            dispatch({ type: "USERS_DATA_ERROR", payload: error.response?.data?.message || "Failed to fetch user data" })
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch user data"
            }
        }
    }
}