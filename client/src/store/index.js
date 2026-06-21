import { configureStore } from '@reduxjs/toolkit';

// Import slices (will add as we build)
// import authSlice from './slices/authSlice';
// import eventSlice from './slices/eventSlice';
// import bookingSlice from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    // auth: authSlice,
    // events: eventSlice,
    // booking: bookingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;