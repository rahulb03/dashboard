import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import loanReducer from "./Loan_Application/loanSlice";
import memberReducer from "./member/memberSlice";
import permissionReducer from "./permissions/permissionSlice";
import paymentConfigReducer from "./payments/paymentConfigSlice";
import salaryReducer from "./salary/salarySlice";
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
import storage from '../lib/storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'],
  debug: process.env.NODE_ENV === 'development',
  // Add transform to handle auth state properly
  transforms: [],
  // Throttle writes to storage
  throttle: 100,
};

const rootReducer = combineReducers({
  auth: authReducer,
  loan: loanReducer,
  member: memberReducer,
  permissions: permissionReducer,
  paymentConfig: paymentConfigReducer,
  salary: salaryReducer,
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
