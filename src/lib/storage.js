import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(key, value) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

// Create storage instance that works with SSR
let storage;
try {
  storage = typeof window !== 'undefined' 
    ? createWebStorage('local') 
    : createNoopStorage();
} catch (error) {
  // Fallback to noop storage if createWebStorage fails
  storage = createNoopStorage();
}

export default storage;
