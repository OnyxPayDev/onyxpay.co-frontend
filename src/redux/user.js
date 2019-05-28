import { getRestClient, handleReqError, getAuthHeader } from "../api/network";
import { LOG_OUT } from "./auth";

const client = getRestClient();

const initialState =
	(sessionStorage.getItem("user") && JSON.parse(sessionStorage.getItem("user"))) || null;

const SAVE_USER = "SAVE_USER";

// const STATUS_CONFIRMED = 2;
// const STATUS_CONFIRMED_EMAIL_ONLY = 1;
// const STATUS_UNCONFIRMED = 0;

export const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case SAVE_USER:
			sessionStorage.setItem("user", JSON.stringify(action.payload));
			return action.payload;
		case LOG_OUT:
			sessionStorage.removeItem("user");
			return null;
		default:
			return state;
	}
};

export const saveUser = user => {
	return { type: SAVE_USER, payload: user };
};

export function getAuthHeaders() {
	const OnyxAuth = sessionStorage.getItem("OnyxAuth");
	const OnyxAddr = sessionStorage.getItem("OnyxAddr");

	if (OnyxAuth && OnyxAddr) {
		return {
			OnyxAuth,
			OnyxAddr,
		};
	}
	throw new Error("no auth data");
}

export const getUserData = () => async (dispatch, getState) => {
	const authHeader = getAuthHeader();
	try {
		const { data } = await client.post("info", null, {
			headers: {
				...authHeader,
			},
		});
		data.role = "user";
		dispatch(saveUser(data));
		return { user: data };
	} catch (er) {
		return handleReqError(er);
	}
};
