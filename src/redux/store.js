import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import loanReducer from "./Loan_Application/loanSlice";
import memberReducer from "./member/memberSlice";
import permissionReducer from "./permissions/permissionSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// Create a noop storage for SSR compatibility
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Use createWebStorage with fallback for SSR
const storageInstance = typeof window !== 'undefined' 
  ? createWebStorage('local')
  : createNoopStorage();

const persistConfig = {
  key: 'root',
  version: 1,
  storage: storageInstance,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  loan: loanReducer,
  member: memberReducer,
  permissions: permissionReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
