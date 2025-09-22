import * as React from 'react';
import { useCallbackRef } from '@/hooks/use-callback-ref';

/**
 * useControllableState - Hook to manage controlled/uncontrolled state
 * Similar to Radix UI's implementation
 */
function useControllableState({ prop, defaultProp, onChange = () => {} }) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;
  const handleChange = useCallbackRef(onChange);

  const setValue = React.useCallback(
    (nextValue) => {
      if (isControlled) {
        const setter = typeof nextValue === 'function' ? nextValue : () => nextValue;
        const newValue = typeof nextValue === 'function' ? setter(prop) : nextValue;
        if (newValue !== prop) handleChange(newValue);
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, handleChange]
  );

  return [value, setValue];
}

function useUncontrolledState({ defaultProp, onChange }) {
  const uncontrolledState = React.useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = React.useRef(value);
  const handleChange = useCallbackRef(onChange);

  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [value, handleChange]);

  return uncontrolledState;
}

export { useControllableState };
