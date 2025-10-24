import { applyMiddleware, combineReducers, createStore } from "redux";
import { authReducer } from "./login/reducer";
// import { wishlistReducer } from "./wishlist/reducer"; // Commented out wishlist

const rootReducer = combineReducers({
  auth: authReducer,
  // wishlist: wishlistReducer, // Commented out wishlist
});

const loggerMiddleware = (store) => (next) => (action) => {
  if (typeof action === "function") {
    return action(store.dispatch);
  }
  next(action);
};

export const store = createStore(
  rootReducer,
  applyMiddleware(loggerMiddleware)
);
