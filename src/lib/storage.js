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
const storage = typeof window !== 'undefined' 
  ? createWebStorage('local') 
  : createNoopStorage();

export default storage;