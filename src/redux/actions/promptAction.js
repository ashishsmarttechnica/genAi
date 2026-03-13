import axiosInstance from "utils/axios";

export const getPromptAction = (page = 1, limit = 10, search = "", categoryId = "", isLoadMore = false) => {
    return async (dispatch) => {
        if (isLoadMore) {
            dispatch({ type: "PROMPT_DATA_LOAD_MORE_LOADING" });
        } else {
            dispatch({ type: "PROMPT_DATA_LOADING" });
        }

        try {
            const res = await axiosInstance.get(`prompt?page=${page}&limit=${limit}&search=${search}&categoryId=${categoryId}`)

            if (res && res.data && res.data.success) {
                if (isLoadMore) {
                    dispatch({ type: "PROMPT_DATA_LOAD_MORE_SUCCESS", payload: res.data, meta: { categoryId } })
                } else {
                    dispatch({ type: "PROMPT_DATA_SUCCESS", payload: res.data, meta: { categoryId } })
                }
                return {
                    success: true,
                    message: res.data.message || "Prompt data fetched successfully!",
                    data: res.data,
                };
            }
            else {
                dispatch({ type: "PROMPT_DATA_ERROR", payload: res.data?.message || "Failed to fetch prompt data" })
                return {
                    success: false,
                    message: res.data?.message || "Failed to fetch prompt data"
                };
            }
        } catch (error) {
            dispatch({ type: "PROMPT_DATA_ERROR", payload: error.response?.data?.message })
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch prompt data"
            }

        }
    }
}




export const updatePromptAction = (categoryId, promptId, newIndex, targetDbIndex, cacheKey = 'ALL') => {
    return async (dispatch, getState) => {
        const previousDataBackup = getState().prompt?.cache?.[cacheKey];
        try {

            // instant feedback (ui update - array position mapping)
            dispatch({
                type: "PROMPT_DATA_MOVE",
                payload: { categoryId, promptId, toIndex: newIndex, targetDbIndex, cacheKey }
            })

            // api call (Database index mapping)
            const res = await axiosInstance.put('prompt/move', {
                categoryId: categoryId,
                promptId: promptId,
                toIndex: targetDbIndex
            });

            if (res && res.data && res.data.success) {
                // DON'T dispatch PROMPT_DATA_SUCCESS here because the move API response 
                // doesn't contain the full prompts array. The optimistic update already 
                // fixed the UI, so we just return success.
                return {
                    success: true,
                    message: res.data.message || "Prompt data move successfully!",
                    data: res,
                };
            } else {
                dispatch({ type: "PROMPT_DATA_MOVE_ERROR", payload: { data: previousDataBackup, cacheKey } });
                console.error("move Failed reverting ui back");
            }
        }
        catch (error) {
            dispatch({ type: "PROMPT_DATA_MOVE_ERROR", payload: { data: previousDataBackup } });
            console.error("Move Api error ", error)
        }
    }
}