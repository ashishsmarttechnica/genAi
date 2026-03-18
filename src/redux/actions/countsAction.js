import axiosClient from "../../utils/axios";

export const getCount = () => {
    return async (dispatch) => {
        try {
            const res = await axiosClient.get("/admin/counts");

            if (res.data.success) {
                dispatch({ type: "GET_COUNT", payload: res.data.data });
            } else {
                dispatch({ type: "GET_COUNT_ERROR", payload: res.data.message });
            }
        } catch (error) {
            dispatch({ type: "GET_COUNT_ERROR", payload: error.message });
        }
    }
}