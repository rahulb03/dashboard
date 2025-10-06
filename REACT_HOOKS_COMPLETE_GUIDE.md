# Complete React Hooks Guide: Everything You Need to Know

> A comprehensive guide covering every React Hook in minute detail, including advanced patterns, performance optimization, and commonly overlooked gotchas.

---

## Table of Contents

1. [Introduction to Hooks](#introduction-to-hooks)
2. [useState](#usestate)
3. [useEffect](#useeffect)
4. [useContext](#usecontext)
5. [useReducer](#usereducer)
6. [useCallback](#usecallback)
7. [useMemo](#usememo)
8. [useRef](#useref)
9. [useImperativeHandle](#useimperativehandle)
10. [useLayoutEffect](#uselayouteffect)
11. [useDebugValue](#usedebugvalue)
12. [useId](#useid)
13. [useTransition](#usetransition)
14. [useDeferredValue](#usedeferredvalue)
15. [useSyncExternalStore](#usesyncexternalstore)
16. [useInsertionEffect](#useinsertioneffect)
17. [Custom Hooks](#custom-hooks)
18. [Advanced Patterns](#advanced-patterns)
19. [Common Mistakes & Gotchas](#common-mistakes--gotchas)
20. [Performance Optimization](#performance-optimization)
21. [Testing Hooks](#testing-hooks)

---

## Introduction to Hooks

### What Are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8.

### Rules of Hooks

**CRITICAL - Must Follow:**

1. **Only call Hooks at the top level** - Don't call Hooks inside loops, conditions, or nested functions
2. **Only call Hooks from React functions** - Call them from React function components or custom Hooks

```javascript
// ❌ WRONG - Conditional Hook
function Bad({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // NEVER do this
  }
}

// ✅ CORRECT
function Good({ condition }) {
  const [state, setState] = useState(0);
  
  if (condition) {
    // Use the hook result conditionally
  }
}
```

### Why These Rules?

React relies on the **order** in which Hooks are called to preserve state between re-renders. Breaking these rules causes bugs.

---

## useState

### Basic Usage

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Deep Dive: How useState Works

```javascript
// React internally maintains an array of state values
// Each useState call corresponds to an index

function Component() {
  const [name, setName] = useState('');     // index 0
  const [age, setAge] = useState(0);        // index 1
  const [email, setEmail] = useState('');   // index 2
  // Order must be consistent across renders!
}
```

### Lazy Initial State

**Often Overlooked:** Initial state is only used during the first render.

```javascript
// ❌ BAD - Expensive calculation runs every render
function Component() {
  const [data, setData] = useState(expensiveCalculation());
}

// ✅ GOOD - Calculation only runs once
function Component() {
  const [data, setData] = useState(() => expensiveCalculation());
}

// Example
function TodoList() {
  const [todos, setTodos] = useState(() => {
    // This only runs once, even though component re-renders
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
}
```

### Functional Updates

**Critical for correctness:**

```javascript
// ❌ WRONG - Can lead to stale state bugs
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(count + 1);
    setCount(count + 1); // Still only increments by 1!
  };
}

// ✅ CORRECT - Always uses latest state
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1); // Correctly increments by 2
  };
}
```

### Batching Updates

**Important:** React batches multiple setState calls in event handlers.

```javascript
function Component() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  function handleClick() {
    setCount(c => c + 1);  // Doesn't re-render yet
    setFlag(f => !f);      // Doesn't re-render yet
    // React batches these and re-renders once
  }
  
  console.log('Render'); // Only logs once per click
}
```

**React 18 Enhancement:** Automatic batching even in promises, setTimeout, etc.

```javascript
// React 18+ batches these too
function handleClick() {
  setTimeout(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // Single re-render in React 18+
  }, 1000);
}
```

### Object and Array State

```javascript
// ❌ WRONG - Mutating state
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const addTodo = (text) => {
    todos.push({ id: Date.now(), text }); // NEVER mutate
    setTodos(todos); // React won't detect change
  };
}

// ✅ CORRECT - Creating new objects/arrays
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text }]);
  };
  
  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  const updateTodo = (id, newText) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };
}
```

### Complex State Updates

```javascript
function UserProfile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  });
  
  // Updating nested objects
  const updateTheme = (theme) => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme
      }
    }));
  };
  
  // Using immer library for easier updates (recommended)
  // npm install immer use-immer
  /*
  import { useImmer } from 'use-immer';
  
  const [user, updateUser] = useImmer({...});
  
  const updateTheme = (theme) => {
    updateUser(draft => {
      draft.preferences.theme = theme; // Direct mutation OK with immer
    });
  };
  */
}
```

### State Initialization Patterns

```javascript
// Pattern 1: Props as initial state
function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  // Note: Only uses initialCount on mount
  // Won't update if prop changes
}

// Pattern 2: Controlled vs Uncontrolled
function Input({ value, onChange }) {
  // Controlled - parent manages state
  return <input value={value} onChange={onChange} />;
}

function Input({ defaultValue }) {
  // Uncontrolled - component manages own state
  const [value, setValue] = useState(defaultValue);
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
```

---

## useEffect

### Basic Usage

```javascript
import { useEffect } from 'react';

function Component() {
  useEffect(() => {
    // Side effect code here
    console.log('Effect ran');
  });
}
```

### The Dependency Array

**Most Important Concept:**

```javascript
// Runs after every render
useEffect(() => {
  console.log('Every render');
});

// Runs only once (on mount)
useEffect(() => {
  console.log('Only on mount');
}, []);

// Runs when dependencies change
useEffect(() => {
  console.log('When count or name changes');
}, [count, name]);
```

### Cleanup Functions

**Often Forgotten:**

```javascript
// ❌ WRONG - Memory leak
function Chat({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    // Missing cleanup!
  }, [roomId]);
}

// ✅ CORRECT - Cleanup prevents leaks
function Chat({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    
    return () => {
      connection.disconnect(); // Cleanup!
    };
  }, [roomId]);
}
```

### Common Cleanup Scenarios

```javascript
// 1. Event Listeners
useEffect(() => {
  const handleResize = () => console.log('Resized');
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// 2. Timers
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);
  
  return () => clearInterval(timer);
}, []);

// 3. Subscriptions
useEffect(() => {
  const subscription = api.subscribe(data => {
    setData(data);
  });
  
  return () => subscription.unsubscribe();
}, []);

// 4. Abort Controllers (Fetch)
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });
  
  return () => controller.abort();
}, []);
```

### Effect Execution Order

**Important to understand:**

```javascript
function Component() {
  console.log('1. Render');
  
  useEffect(() => {
    console.log('3. Effect runs');
    
    return () => {
      console.log('2. Previous effect cleanup');
    };
  });
  
  return <div>Component</div>;
}

// Order on updates:
// 1. Render
// 2. Previous effect cleanup
// 3. Effect runs
```

### Fetching Data

```javascript
// ❌ COMMON MISTAKE - Race condition
function Profile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);
  // Problem: If userId changes quickly, older response might arrive last
}

// ✅ BETTER - Handle race condition
function Profile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    let ignore = false;
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) {
          setUser(data);
        }
      });
    
    return () => {
      ignore = true;
    };
  }, [userId]);
}

// ✅ BEST - Using AbortController
function Profile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      }
    }
    
    fetchUser();
    
    return () => controller.abort();
  }, [userId]);
}
```

### Dependency Array Gotchas

```javascript
// ❌ WRONG - Missing dependencies
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    fetchResults(query).then(setResults);
  }, []); // query is missing!
  // Effect won't run when query changes
}

// ✅ CORRECT
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    fetchResults(query).then(setResults);
  }, [query]);
}

// ❌ WRONG - Object/Array dependencies
function Component({ user }) {
  useEffect(() => {
    console.log('User changed');
  }, [user]); // New object reference every render!
}

// ✅ CORRECT - Depend on primitive values
function Component({ user }) {
  useEffect(() => {
    console.log('User ID changed');
  }, [user.id, user.name]); // Depend on specific properties
}
```

### useEffect vs useLayoutEffect

```javascript
// useEffect - Runs AFTER paint (async)
useEffect(() => {
  // DOM mutations here might cause visual flicker
  element.style.top = '100px';
});

// useLayoutEffect - Runs BEFORE paint (sync)
useLayoutEffect(() => {
  // DOM mutations here are applied before browser paints
  element.style.top = '100px';
});
```

### Effect Dependencies with Functions

**Commonly Overlooked:**

```javascript
// ❌ PROBLEM - Function recreated every render
function Component({ id }) {
  const fetchData = () => {
    fetch(`/api/${id}`).then(/* ... */);
  };
  
  useEffect(() => {
    fetchData();
  }, [fetchData]); // New function every render = infinite loop!
}

// ✅ SOLUTION 1 - Move function inside effect
function Component({ id }) {
  useEffect(() => {
    const fetchData = () => {
      fetch(`/api/${id}`).then(/* ... */);
    };
    
    fetchData();
  }, [id]);
}

// ✅ SOLUTION 2 - Use useCallback
function Component({ id }) {
  const fetchData = useCallback(() => {
    fetch(`/api/${id}`).then(/* ... */);
  }, [id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
}
```

---

## useContext

### Basic Usage

```javascript
import { createContext, useContext, useState } from 'react';

// 1. Create context
const ThemeContext = createContext(null);

// 2. Provide context
function App() {
  const [theme, setTheme] = useState('dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Page />
    </ThemeContext.Provider>
  );
}

// 3. Consume context
function Page() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <div className={theme}>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Creating Robust Context

```javascript
// ✅ BEST PRACTICE - Custom hook with error checking
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}

// Usage
function Component() {
  const { theme, setTheme } = useTheme(); // Type-safe and safe
}
```

### Context Performance Issues

**Critical Understanding:**

```javascript
// ❌ PROBLEM - Every context change re-renders ALL consumers
function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      <Page />
    </AppContext.Provider>
  );
  // Changing theme re-renders components that only need user!
}

// ✅ SOLUTION 1 - Split contexts
function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );
}

// ✅ SOLUTION 2 - Memoize context value
function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  
  const value = useMemo(
    () => ({ user, setUser, theme, setTheme }),
    [user, theme]
  );
  
  return (
    <AppContext.Provider value={value}>
      <Page />
    </AppContext.Provider>
  );
}

// ✅ SOLUTION 3 - Use context selectors (via library)
// npm install use-context-selector
```

### Multiple Context Providers

```javascript
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <Router>
              <MainApp />
            </Router>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Better: Compose providers
function ComposeProviders({ providers, children }) {
  return providers.reduceRight(
    (acc, [Provider, props]) => <Provider {...props}>{acc}</Provider>,
    children
  );
}

function App() {
  return (
    <ComposeProviders
      providers={[
        [AuthProvider, {}],
        [ThemeProvider, {}],
        [LanguageProvider, {}],
        [NotificationProvider, {}]
      ]}
    >
      <Router>
        <MainApp />
      </Router>
    </ComposeProviders>
  );
}
```

### Context with Reducer Pattern

```javascript
// Powerful pattern for complex state
const TodoContext = createContext(null);

function todoReducer(state, action) {
  switch (action.type) {
    case 'added':
      return [...state, { id: action.id, text: action.text }];
    case 'deleted':
      return state.filter(t => t.id !== action.id);
    case 'changed':
      return state.map(t =>
        t.id === action.todo.id ? action.todo : t
      );
    default:
      throw Error('Unknown action: ' + action.type);
  }
}

export function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);
  
  return (
    <TodoContext.Provider value={{ todos, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider');
  }
  return context;
}
```

---

## useReducer

### Basic Usage

```javascript
import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error('Unknown action');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

### When to Use useReducer vs useState

```javascript
// Use useState when:
// - Simple state
// - Independent state updates
const [name, setName] = useState('');
const [email, setEmail] = useState('');

// Use useReducer when:
// - Complex state logic
// - Multiple sub-values
// - Next state depends on previous
// - Want to optimize performance (dispatch doesn't change)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

### Advanced Reducer Patterns

```javascript
// Pattern 1: Reducer with payload
function reducer(state, action) {
  switch (action.type) {
    case 'add_todo':
      return {
        ...state,
        todos: [...state.todos, {
          id: action.payload.id,
          text: action.payload.text,
          completed: false
        }]
      };
    case 'toggle_todo':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    default:
      return state;
  }
}

// Pattern 2: Init function (lazy initialization)
function init(initialCount) {
  return { count: initialCount };
}

function Counter({ initialCount }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  // init only runs once on mount
}

// Pattern 3: TypeScript discriminated unions
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'set':
      return { count: action.payload }; // TypeScript knows payload exists
    default:
      const _exhaustive: never = action; // Ensures all cases handled
      return state;
  }
}
```

### Complex State Management

```javascript
// Real-world example: Form with validation
const initialState = {
  values: {
    username: '',
    email: '',
    password: ''
  },
  errors: {},
  touched: {},
  isSubmitting: false,
  submitCount: 0
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value
        }
      };
    
    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true
        }
      };
    
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };
    
    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true
      };
    
    case 'SUBMIT_SUCCESS':
      return {
        ...initialState,
        submitCount: state.submitCount + 1
      };
    
    case 'SUBMIT_FAILURE':
      return {
        ...state,
        isSubmitting: false,
        errors: action.errors
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

function Form() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });
    
    try {
      await api.register(state.values);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({
        type: 'SUBMIT_FAILURE',
        errors: error.errors
      });
    }
  };
  
  return (/* form JSX */);
}
```

### Immer with useReducer

```javascript
import { useImmerReducer } from 'use-immer';

// Without immer - verbose
function reducer(state, action) {
  switch (action.type) {
    case 'update_nested':
      return {
        ...state,
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            settings: {
              ...state.user.profile.settings,
              theme: action.theme
            }
          }
        }
      };
  }
}

// With immer - simple
function reducer(draft, action) {
  switch (action.type) {
    case 'update_nested':
      draft.user.profile.settings.theme = action.theme;
      break;
  }
}

function Component() {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
}
```

---

## useCallback

### Basic Usage

```javascript
import { useCallback } from 'react';

function Component() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // Function is memoized
  
  return <ExpensiveChild onClick={handleClick} />;
}
```

### When to Use useCallback

```javascript
// ❌ DON'T use useCallback everywhere (premature optimization)
function Component() {
  // No need for useCallback here
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return <button onClick={handleClick}>Click</button>;
  // Native elements don't benefit from memoization
}

// ✅ DO use useCallback when:
// 1. Passing to memoized child components
const MemoizedChild = React.memo(Child);

function Parent() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return <MemoizedChild onClick={handleClick} />;
}

// 2. Function is a dependency of useEffect/useMemo/useCallback
function Component({ id }) {
  const fetchData = useCallback(() => {
    fetch(`/api/${id}`).then(/* ... */);
  }, [id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Won't cause infinite loop
}

// 3. Creating custom hooks that return functions
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []); // Stable reference
  
  return [value, toggle];
}
```

### useCallback with Dependencies

```javascript
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  // ❌ WRONG - Missing dependency
  const fetchResults = useCallback(() => {
    api.search(query).then(setResults);
  }, []); // query is missing!
  
  // ✅ CORRECT
  const fetchResults = useCallback(() => {
    api.search(query).then(setResults);
  }, [query]); // New function when query changes
  
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);
}
```

### Common Pitfall: Stale Closures

```javascript
// ❌ PROBLEM - Stale closure
function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log(count); // Always logs 0!
  }, []); // Empty deps = closure over initial count
  
  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleClick}>Log Count</button>
    </>
  );
}

// ✅ SOLUTION 1 - Include in dependencies
const handleClick = useCallback(() => {
  console.log(count);
}, [count]); // New function when count changes

// ✅ SOLUTION 2 - Use ref for latest value
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);

const handleClick = useCallback(() => {
  console.log(countRef.current); // Always latest
}, []);

// ✅ SOLUTION 3 - Use functional setState
const handleClick = useCallback(() => {
  setCount(c => {
    console.log(c); // Latest value
    return c;
  });
}, []);
```

### useCallback vs Inline Functions

```javascript
// Performance comparison

// Option 1: Inline function (simple, usually fine)
<button onClick={() => handleAction(id)}>
  Click
</button>

// Option 2: useCallback (adds overhead)
const handleClick = useCallback(() => {
  handleAction(id);
}, [id]);

<button onClick={handleClick}>
  Click
</button>

// Recommendation: Start with inline functions
// Only optimize with useCallback if you measure performance issues
```

---

## useMemo

### Basic Usage

```javascript
import { useMemo } from 'react';

function Component({ items }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]); // Only recalculates when items change
  
  return <div>Total: {expensiveValue}</div>;
}
```

### When to Use useMemo

```javascript
// ❌ DON'T use everywhere (premature optimization)
function Component() {
  const value = useMemo(() => 2 + 2, []); // Overkill!
}

// ✅ DO use useMemo when:
// 1. Expensive calculations
function DataTable({ data }) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // Complex sorting logic
    });
  }, [data]);
}

// 2. Referential equality matters
function Parent() {
  const [count, setCount] = useState(0);
  
  // Without useMemo, new object every render
  const config = useMemo(() => ({
    api: '/api/endpoint',
    timeout: 5000
  }), []); // Stable reference
  
  return <MemoizedChild config={config} />;
}

// 3. Preventing expensive child re-renders
function Parent({ items }) {
  const filtered = useMemo(() => 
    items.filter(item => item.active),
    [items]
  );
  
  return <ExpensiveList items={filtered} />;
}
```

### useMemo for Object/Array Stability

```javascript
// Problem: New object reference every render
function Component({ userId }) {
  const options = { userId, format: 'json' }; // New object!
  
  useEffect(() => {
    fetchData(options);
  }, [options]); // Runs every render!
}

// Solution 1: useMemo
function Component({ userId }) {
  const options = useMemo(
    () => ({ userId, format: 'json' }),
    [userId]
  );
  
  useEffect(() => {
    fetchData(options);
  }, [options]); // Only runs when userId changes
}

// Solution 2: Primitive dependencies (better)
function Component({ userId }) {
  useEffect(() => {
    fetchData({ userId, format: 'json' });
  }, [userId]); // Depend on primitive
}
```

### useMemo vs useCallback

```javascript
// These are equivalent:

// useCallback
const memoizedCallback = useCallback(
  () => doSomething(a, b),
  [a, b]
);

// useMemo returning a function
const memoizedCallback = useMemo(
  () => () => doSomething(a, b),
  [a, b]
);

// Rule of thumb:
// useCallback - memoize functions
// useMemo - memoize values (including computed values)
```

### Computing Derived State

```javascript
function TodoList({ todos, filter }) {
  // ❌ BAD - Storing derived state
  const [filteredTodos, setFilteredTodos] = useState([]);
  
  useEffect(() => {
    setFilteredTodos(todos.filter(t => t.category === filter));
  }, [todos, filter]); // Complex and can cause bugs
  
  // ✅ GOOD - Computing during render (usually fine)
  const filteredTodos = todos.filter(t => t.category === filter);
  
  // ✅ BETTER - useMemo if computation is expensive
  const filteredTodos = useMemo(
    () => todos.filter(t => t.category === filter),
    [todos, filter]
  );
}
```

### Measuring Performance

```javascript
// Before optimizing with useMemo, measure!
import { Profiler } from 'react';

function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update"
  actualDuration, // time spent rendering
  baseDuration, // estimated time without memoization
  startTime, // when React began rendering
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  console.log(`${id} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Component />
    </Profiler>
  );
}
```

---

## useRef

### Basic Usage

```javascript
import { useRef } from 'react';

function Component() {
  const ref = useRef(initialValue);
  
  // Access/modify via .current
  ref.current = newValue;
  console.log(ref.current);
}
```

### Use Case 1: DOM References

```javascript
function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}

// Measuring DOM elements
function Component() {
  const divRef = useRef(null);
  
  useEffect(() => {
    const { width, height } = divRef.current.getBoundingClientRect();
    console.log(`Size: ${width}x${height}`);
  }, []);
  
  return <div ref={divRef}>Content</div>;
}
```

### Use Case 2: Storing Mutable Values

**Critical Understanding:** useRef doesn't cause re-renders when changed!

```javascript
// ❌ WRONG - Using state for value that doesn't affect render
function Timer() {
  const [intervalId, setIntervalId] = useState(null);
  // Unnecessary re-render when storing interval ID
}

// ✅ CORRECT - Use ref for mutable values
function Timer() {
  const intervalRef = useRef(null);
  const [count, setCount] = useState(0);
  
  const start = () => {
    if (intervalRef.current) return; // Already running
    
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };
  
  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

### Use Case 3: Previous Values

```javascript
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

function Component({ count }) {
  const previousCount = usePrevious(count);
  
  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount}</p>
    </div>
  );
}
```

### Use Case 4: Avoiding Stale Closures

```javascript
function Component({ value }) {
  const valueRef = useRef(value);
  
  // Keep ref up to date
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  
  const handleClick = useCallback(() => {
    // Always uses latest value
    console.log(valueRef.current);
  }, []); // No dependencies needed
}

// Alternative: useEvent (React RFC)
// This pattern is so common, React might add useEvent hook
function useEvent(handler) {
  const handlerRef = useRef(null);
  
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });
  
  return useCallback((...args) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
}
```

### Ref Callback Pattern

```javascript
// Sometimes you need to do something when ref is set
function Component() {
  const [height, setHeight] = useState(0);
  
  // Ref callback
  const measuredRef = useCallback(node => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);
  
  return <div ref={measuredRef}>Content</div>;
}

// Combining multiple refs
function useCombinedRefs(...refs) {
  return useCallback((element) => {
    refs.forEach(ref => {
      if (!ref) return;
      
      if (typeof ref === 'function') {
        ref(element);
      } else {
        ref.current = element;
      }
    });
  }, refs);
}
```

### Forward Refs

```javascript
import { forwardRef } from 'react';

// Without forwardRef - ref doesn't work
function Input(props) {
  return <input {...props} />;
}

// With forwardRef - ref works
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// Usage
function Parent() {
  const inputRef = useRef(null);
  
  return <Input ref={inputRef} />;
}
```

### Common Mistakes

```javascript
// ❌ WRONG - Ref in dependency array
function Component() {
  const ref = useRef(null);
  
  useEffect(() => {
    console.log(ref.current);
  }, [ref]); // ref never changes - useless dependency
  
  // Should be:
  useEffect(() => {
    console.log(ref.current);
  }, []); // or omit if you need it to run every render
}

// ❌ WRONG - Reading ref during render
function Component() {
  const ref = useRef(0);
  
  ref.current++; // ⚠️ Side effect during render!
  
  // Should use useEffect for side effects
}
```

---

## useImperativeHandle

### Basic Usage

```javascript
import { forwardRef, useImperativeHandle, useRef } from 'react';

const Input = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    scrollIntoView: () => {
      inputRef.current.scrollIntoView();
    }
  }));
  
  return <input ref={inputRef} {...props} />;
});

// Usage
function Parent() {
  const inputRef = useRef(null);
  
  const handleClick = () => {
    inputRef.current.focus();
    // Only methods you exposed are available
  };
  
  return <Input ref={inputRef} />;
}
```

### When to Use

```javascript
// Use when you want to:
// 1. Customize the ref value exposed to parent
// 2. Expose specific methods instead of DOM node
// 3. Create more semantic API

// Example: Video Player
const VideoPlayer = forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current.play();
      setIsPlaying(true);
    },
    pause: () => {
      videoRef.current.pause();
      setIsPlaying(false);
    },
    seek: (time) => {
      videoRef.current.currentTime = time;
    },
    get isPlaying() {
      return isPlaying;
    }
  }));
  
  return <video ref={videoRef} {...props} />;
});

// Parent can use semantic API
function App() {
  const playerRef = useRef(null);
  
  return (
    <>
      <VideoPlayer ref={playerRef} src="video.mp4" />
      <button onClick={() => playerRef.current.play()}>Play</button>
      <button onClick={() => playerRef.current.pause()}>Pause</button>
      <button onClick={() => playerRef.current.seek(30)}>Skip to 30s</button>
    </>
  );
}
```

### Advanced Pattern: Form Handle

```javascript
const Form = forwardRef((props, ref) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  
  useImperativeHandle(ref, () => ({
    submit: async () => {
      const errors = validate(values);
      if (Object.keys(errors).length === 0) {
        return await props.onSubmit(values);
      }
      setErrors(errors);
      throw new Error('Validation failed');
    },
    reset: () => {
      setValues({});
      setErrors({});
    },
    setFieldValue: (field, value) => {
      setValues(v => ({ ...v, [field]: value }));
    },
    getValues: () => values
  }));
  
  return (/* form JSX */);
});

// Usage
function Parent() {
  const formRef = useRef(null);
  
  const handleExternalSubmit = async () => {
    try {
      await formRef.current.submit();
      console.log('Success!');
    } catch (error) {
      console.error('Validation failed');
    }
  };
  
  return (
    <>
      <Form ref={formRef} onSubmit={saveData} />
      <button onClick={handleExternalSubmit}>External Submit</button>
    </>
  );
}
```

### Caution

```javascript
// ⚠️ Generally prefer props over imperative handles
// Only use when imperative API makes sense

// ❌ BAD - Overusing imperative handle
const Counter = forwardRef((props, ref) => {
  const [count, setCount] = useState(0);
  
  useImperativeHandle(ref, () => ({
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1)
  }));
  
  return <div>{count}</div>;
  // Better to just pass count and setCount as props!
});

// ✅ GOOD - Controlling DOM/complex behavior
const Modal = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    open: () => {/* complex open logic */},
    close: () => {/* complex close logic */}
  }));
  // Makes sense - complex imperative behavior
});
```

---

## useLayoutEffect

### Basic Usage

```javascript
import { useLayoutEffect } from 'react';

function Component() {
  useLayoutEffect(() => {
    // Runs synchronously after DOM mutations, before paint
    // Use for DOM measurements/mutations
  }, []);
}
```

### useEffect vs useLayoutEffect

```javascript
// Timeline:
// 1. React updates DOM
// 2. useLayoutEffect runs (synchronous - blocks paint)
// 3. Browser paints screen
// 4. useEffect runs (asynchronous)

// useEffect (99% of cases)
useEffect(() => {
  // Data fetching, subscriptions, etc.
});

// useLayoutEffect (rare cases)
useLayoutEffect(() => {
  // DOM measurements
  // DOM mutations that user should not see
});
```

### When to Use useLayoutEffect

```javascript
// Use Case 1: DOM measurements
function Tooltip({ children }) {
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const tooltipRef = useRef(null);
  
  useLayoutEffect(() => {
    const { height } = tooltipRef.current.getBoundingClientRect();
    setTooltipHeight(height);
    // Runs before paint - no flash of incorrect position
  }, []);
  
  return (
    <div
      ref={tooltipRef}
      style={{ top: -tooltipHeight }}
    >
      {children}
    </div>
  );
}

// Use Case 2: Preventing visual flicker
function Component({ scrollToBottom }) {
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    if (scrollToBottom) {
      ref.current.scrollTop = ref.current.scrollHeight;
      // Happens before paint - user doesn't see scroll
    }
  }, [scrollToBottom]);
  
  return <div ref={ref}>{/* content */}</div>;
}

// Use Case 3: Animations
function AnimatedBox() {
  const boxRef = useRef(null);
  
  useLayoutEffect(() => {
    // Get start position before paint
    const startPos = boxRef.current.getBoundingClientRect();
    
    // Perform animation
    boxRef.current.animate([
      { transform: `translateY(${startPos.top}px)` },
      { transform: 'translateY(0)' }
    ], { duration: 300 });
  }, []);
  
  return <div ref={boxRef}>Animated</div>;
}
```

### Performance Consideration

```javascript
// ⚠️ useLayoutEffect is synchronous - blocks paint
// Can cause performance issues if expensive

// ❌ BAD - Expensive sync operation blocks render
useLayoutEffect(() => {
  // Expensive calculation
  for (let i = 0; i < 1000000; i++) {
    // ...
  }
}, []);

// ✅ BETTER - Use useEffect unless you specifically need layout effect
useEffect(() => {
  // Expensive calculation doesn't block paint
  for (let i = 0; i < 1000000; i++) {
    // ...
  }
}, []);
```

### Server-Side Rendering

```javascript
// ⚠️ useLayoutEffect doesn't run on server
// Can cause hydration mismatches

// Solution: Use isomorphic layout effect
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function Component() {
  useIsomorphicLayoutEffect(() => {
    // Safe for SSR
  }, []);
}
```

---

## useDebugValue

### Basic Usage

```javascript
import { useDebugValue } from 'react';

function useCustomHook(value) {
  useDebugValue(value);
  // Shows label in React DevTools
  
  return value;
}
```

### Practical Examples

```javascript
// Example 1: Simple label
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  useDebugValue(isOnline ? 'Online' : 'Offline');
  
  return isOnline;
}

// Example 2: Formatting function
function useDate() {
  const [date, setDate] = useState(new Date());
  
  useDebugValue(date, date => date.toLocaleString());
  // Formatting function only runs if DevTools is open
  
  return date;
}

// Example 3: Complex state
function useUserStatus(userId) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useDebugValue(
    isLoading 
      ? 'Loading...' 
      : user 
        ? `User: ${user.name}` 
        : 'No user'
  );
  
  return { user, isLoading };
}
```

### When to Use

```javascript
// ✅ DO use in custom hooks that others will use
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  
  useDebugValue(`Matches: ${query} - ${matches}`);
  
  return matches;
}

// ❌ DON'T use in every hook or component
// It's mainly for library authors
```

### Expensive Formatting

```javascript
function useComplexData(data) {
  // ❌ BAD - Expensive formatting always runs
  useDebugValue(JSON.stringify(data, null, 2));
  
  // ✅ GOOD - Only formats if DevTools is open
  useDebugValue(data, data => JSON.stringify(data, null, 2));
}
```

---

## useId

### Basic Usage (React 18+)

```javascript
import { useId } from 'react';

function Component() {
  const id = useId();
  
  return (
    <>
      <label htmlFor={id}>Name:</label>
      <input id={id} type="text" />
    </>
  );
}
```

### Why useId?

```javascript
// ❌ WRONG - Not unique across component instances
function Input() {
  return (
    <>
      <label htmlFor="name">Name:</label>
      <input id="name" type="text" />
    </>
  );
}

function App() {
  return (
    <>
      <Input /> {/* id="name" */}
      <Input /> {/* id="name" - DUPLICATE! */}
    </>
  );
}

// ✅ CORRECT - Unique IDs
function Input() {
  const id = useId();
  
  return (
    <>
      <label htmlFor={id}>Name:</label>
      <input id={id} type="text" />
    </>
  );
}

// Each instance gets unique ID
```

### Multiple IDs from Single useId

```javascript
function Form() {
  const id = useId();
  
  return (
    <>
      <label htmlFor={`${id}-name`}>Name:</label>
      <input id={`${id}-name`} type="text" />
      
      <label htmlFor={`${id}-email`}>Email:</label>
      <input id={`${id}-email`} type="email" />
      
      <label htmlFor={`${id}-password`}>Password:</label>
      <input id={`${id}-password`} type="password" />
    </>
  );
}
```

### SSR Safety

```javascript
// useId is safe for server-side rendering
// IDs are consistent between server and client

// ❌ WRONG - Different IDs on server and client
function Component() {
  const [id] = useState(() => Math.random());
  // Server generates one ID, client generates another
  // Hydration mismatch!
}

// ✅ CORRECT - Same IDs on server and client
function Component() {
  const id = useId();
  // React ensures consistent IDs
}
```

### Accessibility Example

```javascript
function Combobox({ label, options }) {
  const id = useId();
  const [selectedOption, setSelectedOption] = useState(null);
  
  return (
    <>
      <label id={`${id}-label`}>{label}</label>
      <div
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-controls={`${id}-listbox`}
        aria-expanded="false"
      >
        <input id={`${id}-input`} />
      </div>
      <ul
        id={`${id}-listbox`}
        role="listbox"
        aria-labelledby={`${id}-label`}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${id}-option-${index}`}
            role="option"
          >
            {option.label}
          </li>
        ))}
      </ul>
    </>
  );
}
```

---

## useTransition

### Basic Usage (React 18+)

```javascript
import { useTransition, useState } from 'react';

function Component() {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  
  const handleChange = (e) => {
    setInput(e.target.value);
    
    // Mark expensive update as transition
    startTransition(() => {
      const newList = generateLargeList(e.target.value);
      setList(newList);
    });
  };
  
  return (
    <>
      <input value={input} onChange={handleChange} />
      {isPending && <Spinner />}
      <List items={list} />
    </>
  );
}
```

### What are Transitions?

```javascript
// Normal updates (urgent) - must be fast
setInput(value);  // User typing - should be immediate

// Transition updates (non-urgent) - can be slower
startTransition(() => {
  setSearchResults(results);  // Can be interrupted
});

// React prioritizes urgent updates over transitions
// Transitions can be interrupted by urgent updates
```

### Real-World Example: Search

```javascript
function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (e) => {
    const value = e.target.value;
    
    // Urgent: Update input immediately
    setQuery(value);
    
    // Non-urgent: Update results (can be slow)
    startTransition(() => {
      const filtered = expensiveSearch(value);
      setResults(filtered);
    });
  };
  
  return (
    <>
      <input
        value={query}
        onChange={handleSearch}
        placeholder="Search..."
      />
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <SearchResults results={results} />
      )}
    </>
  );
}
```

### Tab Switching

```javascript
function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('home');
  
  const switchTab = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
      // Expensive tab content rendering is a transition
    });
  };
  
  return (
    <>
      <div className="tabs">
        <button
          onClick={() => switchTab('home')}
          disabled={isPending && activeTab !== 'home'}
        >
          Home
        </button>
        <button
          onClick={() => switchTab('profile')}
          disabled={isPending && activeTab !== 'profile'}
        >
          Profile
        </button>
      </div>
      {isPending && <Spinner />}
      <TabContent tab={activeTab} />
    </>
  );
}
```

### useTransition vs setTimeout

```javascript
// ❌ OLD WAY - setTimeout/debounce
function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Delayed update
    setTimeout(() => {
      setResults(search(value));
    }, 300);
    // Problems:
    // - Still blocks if search is slow
    // - Arbitrary timeout value
    // - Not interruptible
  };
}

// ✅ NEW WAY - useTransition
function SearchInput() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    startTransition(() => {
      setResults(search(value));
    });
    // Benefits:
    // - React decides optimal timing
    // - Can be interrupted
    // - Better user experience
  };
}
```

---

## useDeferredValue

### Basic Usage (React 18+)

```javascript
import { useDeferredValue, useState } from 'react';

function Component() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);
  
  // input updates immediately
  // deferredInput updates with lower priority
  
  return (
    <>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <ExpensiveList query={deferredInput} />
    </>
  );
}
```

### useDeferredValue vs useTransition

```javascript
// useTransition - You control the update
function Component() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  
  const handleChange = (e) => {
    startTransition(() => {
      setQuery(e.target.value);
    });
  };
}

// useDeferredValue - React controls the update
function Component() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  const handleChange = (e) => {
    setQuery(e.target.value);
  };
  // Use deferredQuery for expensive operations
}

// Use useTransition when you own the state update
// Use useDeferredValue when you receive a prop/value
```

### Showing Stale Content

```javascript
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  
  const results = useMemo(() => {
    return search(deferredQuery);
  }, [deferredQuery]);
  
  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {results.map(result => (
        <Result key={result.id} data={result} />
      ))}
    </div>
  );
}
```

### Memoization is Required

```javascript
// ❌ WRONG - Re-renders even with deferred value
function List({ query }) {
  const deferredQuery = useDeferredValue(query);
  
  return (
    <ExpensiveList query={deferredQuery} />
    // ExpensiveList re-renders on every change!
  );
}

// ✅ CORRECT - Memoize the expensive component
const ExpensiveList = memo(function ExpensiveList({ query }) {
  const items = useMemo(() => generateItems(query), [query]);
  return items.map(item => <Item key={item.id} {...item} />);
});

function List({ query }) {
  const deferredQuery = useDeferredValue(query);
  
  return <ExpensiveList query={deferredQuery} />;
  // Now ExpensiveList only re-renders when deferredQuery changes
}
```

### Debouncing vs Deferring

```javascript
// Debouncing - Delay update by fixed time
const debouncedValue = useDebounce(value, 500);
// Always waits 500ms, even if not necessary

// Deferring - React decides optimal timing
const deferredValue = useDeferredValue(value);
// Immediate if CPU is free, delayed if busy
// Interruptible by urgent updates
```

---

## useSyncExternalStore

### Basic Usage (React 18+)

```javascript
import { useSyncExternalStore } from 'react';

function Component() {
  const value = useSyncExternalStore(
    subscribe,    // Function to subscribe to store
    getSnapshot,  // Function to get current value
    getServerSnapshot  // Optional: SSR snapshot
  );
}
```

### Why useSyncExternalStore?

This hook is primarily for library authors to integrate external stores with React 18's concurrent features.

```javascript
// Problem: External store + concurrent rendering = tearing
// Tearing: Different components seeing different values

// Solution: useSyncExternalStore ensures consistency
```

### Example: Window Dimensions

```javascript
function useWindowDimensions() {
  const subscribe = (callback) => {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  };
  
  const getSnapshot = () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };
  
  const getServerSnapshot = () => {
    return {
      width: 0,
      height: 0
    };
  };
  
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}

// Usage
function Component() {
  const { width, height } = useWindowDimensions();
  return <div>{width}x{height}</div>;
}
```

### Example: Online Status

```javascript
function useOnlineStatus() {
  const subscribe = (callback) => {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    
    return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
    };
  };
  
  const getSnapshot = () => {
    return navigator.onLine;
  };
  
  const getServerSnapshot = () => {
    return true; // Assume online on server
  };
  
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}
```

### Example: Custom Store

```javascript
// Create a store
class Store {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = new Set();
  }
  
  getState() {
    return this.state;
  }
  
  setState(newState) {
    this.state = newState;
    this.listeners.forEach(listener => listener());
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Create store instance
const store = new Store({ count: 0 });

// Hook to use store
function useStore() {
  const state = useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => store.getState(),
    () => store.getState() // Same on server
  );
  
  return state;
}

// Usage
function Counter() {
  const { count } = useStore();
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => store.setState({ count: count + 1 })}>
        Increment
      </button>
    </>
  );
}
```

### Selector Pattern

```javascript
function useStoreSelector(selector) {
  const state = useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => selector(store.getState()),
    () => selector(store.getState())
  );
  
  return state;
}

// Usage - only re-renders when selected value changes
function Component() {
  const count = useStoreSelector(state => state.count);
  // Doesn't re-render when other parts of state change
}
```

---

## useInsertionEffect

### Basic Usage (React 18+)

```javascript
import { useInsertionEffect } from 'react';

function Component() {
  useInsertionEffect(() => {
    // Runs before DOM mutations
    // Used for CSS-in-JS libraries
  }, []);
}
```

### When to Use

**This hook is for CSS-in-JS library authors only.**

```javascript
// Timing:
// 1. useInsertionEffect (inject styles)
// 2. useLayoutEffect (read layout)
// 3. Browser paints
// 4. useEffect

// Example: CSS-in-JS library
function useCSS(rule) {
  useInsertionEffect(() => {
    // Inject CSS before React makes DOM changes
    const sheet = document.styleSheets[0];
    const index = sheet.insertRule(rule);
    
    return () => {
      sheet.deleteRule(index);
    };
  }, [rule]);
}

// Usage in component
function Button() {
  useCSS('.btn { color: blue; }');
  return <button className="btn">Click</button>;
}
```

### Why Not useLayoutEffect?

```javascript
// Problem with useLayoutEffect for CSS injection:
// 1. Component renders
// 2. Layout effect runs and injects CSS
// 3. Layout changes due to new CSS
// 4. Browser has to recalculate layout
// = Performance issue

// Solution with useInsertionEffect:
// 1. Insertion effect injects CSS
// 2. Component renders with CSS already present
// 3. No layout recalculation needed
// = Better performance
```

---

## Custom Hooks

### What are Custom Hooks?

Custom hooks are JavaScript functions that use other hooks and follow the naming convention `use*`.

```javascript
// Basic custom hook
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return width;
}

// Usage
function Component() {
  const width = useWindowWidth();
  return <div>Width: {width}</div>;
}
```

### Rules for Custom Hooks

1. **Name must start with "use"** - Allows React to enforce Hook rules
2. **Can call other Hooks** - Compose functionality
3. **Can be called conditionally** - Unlike built-in Hooks
4. **Should be reusable** - Extract common logic

```javascript
// ✅ CORRECT
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  return { count, increment };
}

// ❌ WRONG - Doesn't start with "use"
function counter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  // React won't enforce Hook rules
}
```

### Common Patterns

#### 1. Data Fetching

```javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    return () => controller.abort();
  }, [url]);
  
  return { data, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>Hello, {user.name}!</div>;
}
```

#### 2. Local Storage Sync

```javascript
function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// Usage
function TodoList() {
  const [todos, setTodos] = useLocalStorage('todos', []);
  
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text }]);
  };
  
  return (/* JSX */);
}
```

#### 3. Form Handling

```javascript
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    if (validate) {
      const fieldError = validate({ ...values })[name];
      if (fieldError) {
        setErrors(prev => ({ ...prev, [name]: fieldError }));
      }
    }
  };
  
  const handleSubmit = async (onSubmit) => async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    
    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
}

// Usage
function LoginForm() {
  const validate = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = 'Email is required';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };
  
  const form = useForm(
    { email: '', password: '' },
    validate
  );
  
  const onSubmit = async (values) => {
    await login(values);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && (
        <span>{form.errors.email}</span>
      )}
      
      <input
        name="password"
        type="password"
        value={form.values.password}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.password && form.errors.password && (
        <span>{form.errors.password}</span>
      )}
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

#### 4. Previous Value

```javascript
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// Usage
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

#### 5. Debounce

```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery) {
      // Only search after user stops typing for 500ms
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

#### 6. Media Query

```javascript
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handler = (e) => setMatches(e.matches);
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);
  
  return matches;
}

// Usage
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return (
    <div>
      {isMobile && <MobileLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

#### 7. Interval

```javascript
function useInterval(callback, delay) {
  const savedCallback = useRef();
  
  // Remember latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up interval
  useEffect(() => {
    if (delay === null) return;
    
    const tick = () => {
      savedCallback.current();
    };
    
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Usage
function Timer() {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(true);
  
  useInterval(() => {
    setCount(count + 1);
  }, isRunning ? delay : null);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
```

#### 8. Click Outside

```javascript
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendants
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Usage
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  
  useClickOutside(ref, () => {
    setIsOpen(false);
  });
  
  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      {isOpen && (
        <div className="dropdown">
          Dropdown content
        </div>
      )}
    </div>
  );
}
```

#### 9. Async State

```javascript
function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setData(null);
    setError(null);
    
    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return {
    execute,
    status,
    data,
    error,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle'
  };
}

// Usage
function UserProfile({ userId }) {
  const fetchUser = useCallback(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    [userId]
  );
  
  const { data: user, isLoading, isError, error, execute } = useAsync(
    fetchUser,
    true  // Fetch immediately
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={execute}>Refresh</button>
    </div>
  );
}
```

#### 10. Toggle

```javascript
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);
  
  return [value, toggle, setTrue, setFalse];
}

// Usage
function Modal() {
  const [isOpen, toggle, open, close] = useToggle(false);
  
  return (
    <>
      <button onClick={open}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <button onClick={close}>Close</button>
          <div>Modal content</div>
        </div>
      )}
    </>
  );
}
```

---

## Advanced Patterns

### 1. Compound Components

```javascript
// Create context for shared state
const TabsContext = createContext(null);

function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  return <div className="tab-panels">{children}</div>;
}

function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;
  
  return <div className="tab-panel">{children}</div>;
}

// Compose the API
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// Usage
function App() {
  return (
    <Tabs defaultValue="home">
      <Tabs.List>
        <Tabs.Tab value="home">Home</Tabs.Tab>
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panels>
        <Tabs.Panel value="home">Home content</Tabs.Panel>
        <Tabs.Panel value="profile">Profile content</Tabs.Panel>
        <Tabs.Panel value="settings">Settings content</Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

### 2. Render Props with Hooks

```javascript
function DataProvider({ url, children }) {
  const { data, loading, error } = useFetch(url);
  
  return children({ data, loading, error });
}

// Usage
function App() {
  return (
    <DataProvider url="/api/users">
      {({ data, loading, error }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error}</div>;
        return <UserList users={data} />;
      }}
    </DataProvider>
  );
}
```

### 3. State Reducer Pattern

```javascript
function useCounter(initialCount = 0, reducer) {
  const [count, dispatch] = useReducer(
    reducer || defaultReducer,
    initialCount
  );
  
  const increment = () => dispatch({ type: 'increment' });
  const decrement = () => dispatch({ type: 'decrement' });
  const reset = () => dispatch({ type: 'reset', payload: initialCount });
  
  return { count, increment, decrement, reset };
}

function defaultReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    case 'reset':
      return action.payload;
    default:
      return state;
  }
}

// Users can override behavior
function customReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return state + 10; // Custom: increment by 10
    case 'decrement':
      return Math.max(0, state - 1); // Custom: never go below 0
    default:
      return defaultReducer(state, action);
  }
}

// Usage
function Counter() {
  const { count, increment, decrement } = useCounter(0, customReducer);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

### 4. Controlled Props Pattern

```javascript
function useControllableState(controlledValue, defaultValue, onChange) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const setValue = useCallback(
    (newValue) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );
  
  return [value, setValue];
}

// Usage in component
function Input({ value: controlledValue, defaultValue, onChange, ...props }) {
  const [value, setValue] = useControllableState(
    controlledValue,
    defaultValue,
    onChange
  );
  
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      {...props}
    />
  );
}

// Can be used as controlled
<Input value={value} onChange={setValue} />

// Or uncontrolled
<Input defaultValue="hello" onChange={handleChange} />
```

### 5. Composition with Multiple Hooks

```javascript
function useUser(userId) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`);
  const [favorites, setFavorites] = useLocalStorage(`favorites-${userId}`, []);
  const isOnline = useOnlineStatus();
  
  const addFavorite = useCallback((itemId) => {
    setFavorites(prev => [...prev, itemId]);
  }, [setFavorites]);
  
  const removeFavorite = useCallback((itemId) => {
    setFavorites(prev => prev.filter(id => id !== itemId));
  }, [setFavorites]);
  
  return {
    user: data,
    loading,
    error,
    favorites,
    addFavorite,
    removeFavorite,
    isOnline
  };
}

// Usage
function UserProfile({ userId }) {
  const {
    user,
    loading,
    favorites,
    addFavorite,
    isOnline
  } = useUser(userId);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name} {isOnline && '🟢'}</h1>
      <p>Favorites: {favorites.length}</p>
    </div>
  );
}
```

---

## Common Mistakes & Gotchas

### 1. Infinite Loops

```javascript
// ❌ WRONG - Infinite loop
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(count + 1); // Changes count...
  }, [count]); // ...which triggers effect again!
}

// ✅ CORRECT
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Run only once
    setCount(c => c + 1);
  }, []);
}
```

### 2. Stale Closures

```javascript
// ❌ WRONG - Stale closure
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count); // Always logs 0!
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // Empty deps = closure over initial count
}

// ✅ SOLUTION 1 - Use functional update
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        console.log(c); // Latest value
        return c;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
}

// ✅ SOLUTION 2 - Use ref
function Component() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(countRef.current); // Latest value
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
}
```

### 3. Object/Array Dependencies

```javascript
// ❌ WRONG - New object every render
function Component({ userId }) {
  const config = { userId, format: 'json' };
  
  useEffect(() => {
    fetchData(config);
  }, [config]); // New object = runs every render
}

// ✅ CORRECT - Depend on primitives
function Component({ userId }) {
  useEffect(() => {
    const config = { userId, format: 'json' };
    fetchData(config);
  }, [userId]);
}

// ✅ CORRECT - Memoize object
function Component({ userId }) {
  const config = useMemo(
    () => ({ userId, format: 'json' }),
    [userId]
  );
  
  useEffect(() => {
    fetchData(config);
  }, [config]);
}
```

### 4. Missing Dependencies

```javascript
// ❌ WRONG - Missing dependency
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    fetchResults(query).then(setResults);
  }, []); // query missing!
}

// ✅ CORRECT
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    fetchResults(query).then(setResults);
  }, [query]);
}

// Install eslint-plugin-react-hooks to catch these!
```

### 5. useState Initialization

```javascript
// ❌ WRONG - Expensive calculation every render
function Component() {
  const [data, setData] = useState(expensiveCalculation());
}

// ✅ CORRECT - Lazy initialization
function Component() {
  const [data, setData] = useState(() => expensiveCalculation());
}
```

### 6. Direct State Mutation

```javascript
// ❌ WRONG - Mutating state
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const addTodo = (text) => {
    todos.push({ id: Date.now(), text });
    setTodos(todos); // React won't detect change!
  };
}

// ✅ CORRECT - Create new array
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text }]);
  };
}
```

### 7. useEffect Cleanup

```javascript
// ❌ WRONG - Missing cleanup
function Component() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    // Missing cleanup - memory leak!
  }, []);
}

// ✅ CORRECT
function Component() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
}
```

### 8. Async useEffect

```javascript
// ❌ WRONG - async effect function
useEffect(async () => {
  const data = await fetchData();
  setData(data);
}, []);
// useEffect expects a cleanup function, not a promise!

// ✅ CORRECT - async function inside
useEffect(() => {
  async function fetch() {
    const data = await fetchData();
    setData(data);
  }
  
  fetch();
}, []);

// ✅ CORRECT - IIFE
useEffect(() => {
  (async () => {
    const data = await fetchData();
    setData(data);
  })();
}, []);
```

### 9. useCallback/useMemo Overuse

```javascript
// ❌ WRONG - Unnecessary optimization
function Component() {
  const value = useMemo(() => 2 + 2, []); // Overkill
  
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <button onClick={handleClick}>{value}</button>;
  // Native elements don't benefit from this
}

// ✅ CORRECT - Simple is better
function Component() {
  const value = 4;
  
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <button onClick={handleClick}>{value}</button>;
}
```

### 10. Ref in Dependency Array

```javascript
// ❌ WRONG - Ref in dependencies
function Component() {
  const ref = useRef(0);
  
  useEffect(() => {
    console.log(ref.current);
  }, [ref]); // ref never changes!
}

// ✅ CORRECT
function Component() {
  const ref = useRef(0);
  
  useEffect(() => {
    console.log(ref.current);
  }, []); // Omit ref from dependencies
}
```

---

## Performance Optimization

### 1. React.memo

```javascript
// Prevents re-render if props haven't changed
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
  return <div>{/* Complex JSX */}</div>;
});

// Custom comparison function
const Component = React.memo(
  function Component({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if passing nextProps would render the same result
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 2. useMemo for Expensive Calculations

```javascript
function DataTable({ data, filters }) {
  // Only recalculate when data or filters change
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Expensive filtering logic
      return matchesFilters(item, filters);
    }).sort((a, b) => {
      // Expensive sorting
      return expensiveCompare(a, b);
    });
  }, [data, filters]);
  
  return <Table data={filteredData} />;
}
```

### 3. useCallback for Stable References

```javascript
function Parent() {
  const [count, setCount] = useState(0);
  
  // Without useCallback, new function every render
  // MemoizedChild would re-render unnecessarily
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <MemoizedChild onClick={handleClick} />
    </>
  );
}

const MemoizedChild = React.memo(function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Child Button</button>;
});
```

### 4. Code Splitting

```javascript
import { lazy, Suspense } from 'react';

// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 5. Virtualization for Long Lists

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Debouncing Expensive Operations

```javascript
function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  // Expensive search only runs with deferred value
  const results = useMemo(() => {
    return expensiveSearch(deferredQuery);
  }, [deferredQuery]);
  
  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <Results items={results} />
    </>
  );
}
```

### 7. Avoiding Inline Objects/Arrays

```javascript
// ❌ BAD - New object every render
function Parent() {
  return <Child style={{ color: 'red' }} />;
  // If Child is memoized, it re-renders anyway
}

// ✅ GOOD - Stable reference
const style = { color: 'red' };

function Parent() {
  return <Child style={style} />;
}

// ✅ GOOD - Memoize
function Parent() {
  const style = useMemo(() => ({ color: 'red' }), []);
  return <Child style={style} />;
}
```

### 8. Context Optimization

```javascript
// Split contexts to avoid unnecessary re-renders
function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  
  // User context - changes rarely
  const userValue = useMemo(() => ({ user, setUser }), [user]);
  
  // Theme context - changes more often
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  
  return (
    <UserContext.Provider value={userValue}>
      <ThemeContext.Provider value={themeValue}>
        <App />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
```

---

## Testing Hooks

### 1. Testing Custom Hooks

```javascript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter(0));
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});

test('should decrement counter', () => {
  const { result } = renderHook(() => useCounter(10));
  
  act(() => {
    result.current.decrement();
  });
  
  expect(result.current.count).toBe(9);
});
```

### 2. Testing with Props

```javascript
test('should update when props change', () => {
  const { result, rerender } = renderHook(
    ({ initialCount }) => useCounter(initialCount),
    { initialProps: { initialCount: 0 } }
  );
  
  expect(result.current.count).toBe(0);
  
  rerender({ initialCount: 10 });
  
  expect(result.current.count).toBe(10);
});
```

### 3. Testing Async Hooks

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

test('should fetch data', async () => {
  const { result } = renderHook(() => useFetch('/api/users'));
  
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBe(null);
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.data).toEqual([
    { id: 1, name: 'John' }
  ]);
});
```

### 4. Mocking Dependencies

```javascript
import { renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

// Mock localStorage
beforeEach(() => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
  };
  global.localStorage = localStorageMock;
});

test('should read from localStorage', () => {
  localStorage.getItem.mockReturnValue('"saved value"');
  
  const { result } = renderHook(() => useLocalStorage('key', 'default'));
  
  expect(result.current[0]).toBe('saved value');
});
```

### 5. Testing Context

```javascript
import { renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

test('should use theme from context', () => {
  const wrapper = ({ children }) => (
    <ThemeProvider value="dark">
      {children}
    </ThemeProvider>
  );
  
  const { result } = renderHook(() => useTheme(), { wrapper });
  
  expect(result.current.theme).toBe('dark');
});
```

---

## Best Practices Summary

### ✅ DO

1. **Follow the Rules of Hooks** - Only call at top level, only from React functions
2. **Use ESLint plugin** - `eslint-plugin-react-hooks` catches mistakes
3. **Include all dependencies** - In useEffect, useCallback, useMemo
4. **Use functional updates** - When new state depends on previous
5. **Cleanup side effects** - Return cleanup function from useEffect
6. **Extract custom hooks** - Reuse logic across components
7. **Use TypeScript** - Better type safety and autocomplete
8. **Measure before optimizing** - Use React DevTools Profiler
9. **Prefer composition** - Small, focused hooks over large ones
10. **Test your hooks** - Use @testing-library/react

### ❌ DON'T

1. **Don't call hooks conditionally** - Breaks hook ordering
2. **Don't forget cleanup** - Causes memory leaks
3. **Don't mutate state** - Always create new objects/arrays
4. **Don't optimize prematurely** - useMemo/useCallback have overhead
5. **Don't make async effect functions** - Use async function inside
6. **Don't ignore dependency warnings** - Usually indicates a bug
7. **Don't use refs in dependency arrays** - They never change
8. **Don't store derived state** - Calculate during render instead
9. **Don't over-context** - Split contexts for better performance
10. **Don't skip reading the docs** - React docs are excellent

---

## Resources

### Official Documentation
- [React Hooks Reference](https://react.dev/reference/react)
- [React Hooks FAQ](https://react.dev/learn)

### Tools
- `eslint-plugin-react-hooks` - Enforces Hook rules
- React DevTools - Debug and profile
- `@testing-library/react` - Test hooks and components

### Libraries
- `use-immer` - Easier immutable updates
- `@tanstack/react-query` - Data fetching
- `zustand` - Simple state management
- `jotai` - Atomic state management
- `use-context-selector` - Optimized context

---

## Conclusion

React Hooks are powerful but require understanding. Key takeaways:

1. **Master the fundamentals** - useState, useEffect, useContext
2. **Understand closures** - Stale closures cause many bugs
3. **Think in React** - Declarative, not imperative
4. **Performance is not always needed** - Profile first
5. **Practice and experiment** - Build things to learn

Happy coding! 🚀
