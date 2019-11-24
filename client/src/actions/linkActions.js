import axios from "axios";

import { ADD_LINK, GET_LINKS, GET_ERRORS } from "./types";

// Add Link
export const addLink = linkData => dispatch => {
    axios
        .post("http://localhost:5000/api/links", linkData)
        .then(res =>
            dispatch({
                type: ADD_LINK,
                payload: res.data
            })
        )
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

// Get Links
export const getLinks = () => dispatch => {
    axios
        .get("http://localhost:5000/api/links")
        .then(res =>
            dispatch({
                type: GET_LINKS,
                payload: res.data
            })
        )
        .catch(err =>
            dispatch({
                type: GET_LINKS,
                payload: null
            })
        );
};
