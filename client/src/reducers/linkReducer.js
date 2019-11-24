import { ADD_LINK, GET_LINKS } from "../actions/types";

const initialState = {
    links: [],
    link: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_LINKS:
            return {
                ...state,
                links: action.payload
            };
        case ADD_LINK:
            return {
                ...state,
                links: [action.payload, ...state.links]
            };
        default:
            return state;
    }
};
