import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import loanReducer from "./Loan_Application/loanSlice";
import memberReducer from "./member/memberSlice";
import membershipReducer from "./membership/membershipSlice";
import permissionReducer from "./permissions/permissionSlice";
import paymentConfigReducer from "./payments/paymentConfigSlice";
import paymentsReducer from "./payments/paymentSlice";
import salaryReducer from "./salary/salarySlice";
import trackingReducer from "./tracking/trackingSlice";
import newTrackingReducer from "./tracking/newTrackingSlice";
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
  membership: membershipReducer,
  permissions: permissionReducer,
  paymentConfig: paymentConfigReducer,
  payments: paymentsReducer,
  salary: salaryReducer,
  tracking: trackingReducer,
  newTracking: newTrackingReducer,
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
