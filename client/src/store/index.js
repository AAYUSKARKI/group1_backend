import { configureStore as ConfigureStore, combineReducers } from "@reduxjs/toolkit"
import authReducer from "@/src/store/authSlice";
import categoryReducer from "@/src/store/categorySlice";
import menuItemReducer from "@/src/store/menuItemSlice";
import tableReducer from "@/src/store/tableSlice";
import reservationReducer from "@/src/store/reservationSlice";
import orderReducer from "@/src/store/orderSlice";
import allergenReducer from "@/src/store/allergenSlice";
import menuItemAllergenReducer from "@/src/store/menuItemAllergenSlice";
import billReducer from "@/src/store/billSlice";
import surplusReducer from "@/src/store/surplusSlice";
import kdsReducer from "@/src/store/kdsSlice";
import auditLogReducer from "@/src/store/auditLogSlice";
import healthReducer from "@/src/store/healthSlice";
import themeReducer from "@/src/store/themeSlice";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import persistStore from "redux-persist/es/persistStore";

const userPersistConfig = {
  key: 'auth',
  version: 1,
  storage,
}


const persistedAuthReducer = persistReducer(userPersistConfig, authReducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  category: categoryReducer,
  menuItem: menuItemReducer,
  table: tableReducer,
  reservation: reservationReducer,
  order: orderReducer,
  allergen: allergenReducer,
  menuItemAllergen: menuItemAllergenReducer,
  bill: billReducer,
  surplus: surplusReducer,
  kds: kdsReducer,
  auditLog: auditLogReducer,
  health: healthReducer,
  theme: themeReducer
});

// Configure the store
const store = ConfigureStore({
  reducer:rootReducer,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      
    },
  }),
});

export const persistor = persistStore(store);

export default store