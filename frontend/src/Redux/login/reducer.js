import {
  AUTH,
  AUTH_ERROR,
  AUTH_LOADING,
  CLEAR_ERROR,
  LOGOUT,
  UPDATE_USER,
} from "./action";

const initState = {
  user: {},
  loading: false,
  error: false,
};

export const authReducer = (store = initState, { type, payload }) => {
  switch (type) {
    case AUTH:
      // When user is authenticated, store token in localStorage
      if (payload?.token) {
        localStorage.setItem("token", payload.token);
      }
      return { ...store, user: payload, error: false };
    case AUTH_LOADING:
      return { ...store, loading: payload };
    case AUTH_ERROR:
      return { ...store, error: payload, loading: false };
    case CLEAR_ERROR:
      return { ...store, error: false };
    case UPDATE_USER:
      return { ...store, user: payload };
    case LOGOUT:
      // ONLY place where token is cleared from localStorage

      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        localStorage.removeItem("token");
      }
      return { ...initState };
    default:
      return store;
  }
};
