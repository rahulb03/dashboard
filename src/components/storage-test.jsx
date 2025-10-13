'use client';
import { useState, useEffect } from 'react';

export function StorageTest() {
  const [testResult, setTestResult] = useState('');
  
  const runStorageTest = () => {
    try {
      // console.log('🧪 Starting localStorage test...');
      
      // Test basic localStorage functionality
      const testKey = 'storage_test_' + Date.now();
      const testValue = 'test_value_' + Math.random();
      
      console.log('🧪 Setting test item:', { testKey, testValue });
      localStorage.setItem(testKey, testValue);
      
      const retrievedValue = localStorage.getItem(testKey);
      console.log('🧪 Retrieved test item:', { retrievedValue });
      
      const isMatching = retrievedValue === testValue;
      console.log('🧪 Values match:', isMatching);
      
      // Clean up test data
      localStorage.removeItem(testKey);
      
      if (isMatching) {
        setTestResult('✅ localStorage is working correctly');
      } else {
        setTestResult('❌ localStorage values don\'t match');
      }
      
      // Test current auth storage
      const currentToken = localStorage.getItem('token');
      const currentUser = localStorage.getItem('userdetail');
      
      console.log('🧪 Current auth storage:', {
        hasToken: !!currentToken,
        hasUser: !!currentUser,
        tokenValue: currentToken,
        userValue: currentUser
      });
      
      // Test Redux persist storage
      const persistRoot = localStorage.getItem('persist:root');
      console.log('🧪 Redux persist storage:', {
        hasPersistRoot: !!persistRoot,
        persistRootValue: persistRoot
      });
      
      if (persistRoot) {
        try {
          const parsedPersist = JSON.parse(persistRoot);
          console.log('🧪 Parsed persist data:', parsedPersist);
          
          if (parsedPersist.auth) {
            const authPersist = JSON.parse(parsedPersist.auth);
            console.log('🧪 Persisted auth state:', authPersist);
          }
        } catch (e) {
          console.error('🧪 Error parsing persist data:', e);
        }
      }
      
    } catch (error) {
      console.error('🧪 localStorage test failed:', error);
      setTestResult('❌ localStorage test failed: ' + error.message);
    }
  };
  
  useEffect(() => {
    runStorageTest();
  }, []);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed top-4 left-4 p-4 bg-yellow-500/90 text-black text-xs rounded-lg max-w-md z-50">
      <div className="font-bold mb-2">Storage Test:</div>
      <div className="mb-2">{testResult}</div>
      <button 
        onClick={runStorageTest}
        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
      >
        Run Test Again
      </button>
    </div>
  );
}