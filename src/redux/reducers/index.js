import { combineReducers } from "redux";
import AdminReducer from "./adminReducer";
import CategoryDataReducer from "./categoryDataReducer";
import PromptReducer from './promptReducer'
import UsersDataReducer from "./usersDataReducer";
import { carouselReducer } from "./carouselReducer";
import { countReducer } from "./countReducer";

const rootReducer = combineReducers({
    adminDetails: AdminReducer,
    categoryData: CategoryDataReducer,
    prompt: PromptReducer,
    usersData: UsersDataReducer,
    carousel: carouselReducer,
    count: countReducer
})

export default rootReducer;
