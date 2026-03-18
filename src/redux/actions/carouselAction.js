import axiosClient from "utils/axios";

// Fetch all carousel data
export const getCarouselData = (page = 1) => {
    return async (dispatch) => {
        dispatch({ type: "CAROUSEL_DATA_LOADING" });
        try {
            const response = await axiosClient.get(`/carousel?page=${page}`);

            if (response?.data?.success) {
                dispatch({ type: "CAROUSEL_DATA_SUCCESS", payload: response.data });
                return { success: true, message: response.data.message };
            } else {
                dispatch({ type: "CAROUSEL_DATA_ERROR", payload: response.data?.message || "Failed to fetch carousel data" });
                return { success: false, message: response.data?.message };
            }
        } catch (error) {
            dispatch({ type: "CAROUSEL_DATA_ERROR", payload: error.response?.data?.message || "Something went wrong" });
            return { success: false, message: error.response?.data?.message };
        }
    };
};

// Create new carousel item
export const createCarouselData = (data) => {
    return async (dispatch) => {
        dispatch({ type: "CAROUSEL_DATA_MUTATION_LOADING" });
        try {
            const response = await axiosClient.post("/carousel", data);
            if (response?.data?.success) {
                dispatch({ type: "CAROUSEL_DATA_CREATE_SUCCESS", payload: response.data });
                return { success: true, message: response.data.message };
            } else {
                dispatch({ type: "CAROUSEL_DATA_ERROR", payload: response.data?.message || "Failed to create carousel" });
                return { success: false, message: response.data?.message };
            }
        } catch (error) {
            dispatch({ type: "CAROUSEL_DATA_ERROR", payload: error.response?.data?.message || "Something went wrong" });
            return { success: false, message: error.response?.data?.message };
        }
    };
};

// Delete carousel item
export const deleteCarouselData = (carouselId) => {
    return async (dispatch) => {
        dispatch({ type: "CAROUSEL_DATA_MUTATION_LOADING" });
        try {
            const response = await axiosClient.delete(`/carousel/${carouselId}`);
            if (response?.data?.success) {
                dispatch({ type: "CAROUSEL_DATA_DELETE_SUCCESS", payload: carouselId });
                return { success: true, message: response.data.message };
            } else {
                dispatch({ type: "CAROUSEL_DATA_ERROR", payload: response.data?.message || "Failed to delete" });
                return { success: false, message: response.data?.message };
            }
        } catch (error) {
            dispatch({ type: "CAROUSEL_DATA_ERROR", payload: error.response?.data?.message || "Something went wrong" });
            return { success: false, message: error.response?.data?.message };
        }
    };
};

// Update carousel item (status toggle)
export const updateCarouselData = (carouselId, data) => {
    return async (dispatch, getState) => {
        const previousDataBackup = getState().carousel.data;

        // Optimistic Update: Update Redux state immediately
        dispatch({
            type: "CAROUSEL_DATA_UPDATE",
            payload: { carouselId, data }
        });

        try {
            let body = data;
            // If data is a plain object and contains a File, convert to FormData
            if (!(data instanceof FormData) && data.image && typeof data.image !== 'string') {
                body = new FormData();
                Object.keys(data).forEach(key => {
                    body.append(key, data[key]);
                });
            }

            const response = await axiosClient.put(`/carousel/${carouselId}`, body,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });

            if (response?.data?.success) {
                dispatch({ type: "CAROUSEL_DATA_UPDATE_SUCCESS", payload: response.data.data });
                return { success: true, message: response.data.message };
            } else {
                // Revert on failure
                dispatch({ type: "CAROUSEL_DATA_SUCCESS", payload: previousDataBackup });
                return { success: false, message: response.data?.message || "Failed to update carousel" };
            }
        } catch (error) {
            // Revert on error
            dispatch({ type: "CAROUSEL_DATA_SUCCESS", payload: previousDataBackup });
            return { success: false, message: error.response?.data?.message || "Something went wrong" };
        }
    };
};

// Move carousel data (reorder)
// export const moveCarouselDataAction = (carouselId, newIndex) => {
//     return async (dispatch) => {
//         // dispatch({ type: "CAROUSEL_DATA_MUTATION_LOADING" });
//         try {
//             const response = await axiosClient.put(`/carousel/move/${carouselId}`, {
//                 newIndex
//             });
//             if (response?.data?.success) {
//                 // dispatch({ type: "CAROUSEL_DATA_MOVE_SUCCESS", payload: response.data });
//                 return { success: true, message: response.data.message };
//             } else {
//                 return { success: false, message: response.data?.message };
//             }
//         } catch (error) {
//             return { success: false, message: error.response?.data?.message };
//         }
//     };
// };