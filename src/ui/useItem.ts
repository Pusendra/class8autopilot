import { useEffect, useState } from 'react';
import type { WxtStorageItem } from 'wxt/utils/storage';

/** Live value of a storage item; undefined until the first read resolves. */
export function useItem<T>(item: WxtStorageItem<T, Record<string, unknown>>): T | undefined {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    let live = true;
    item.getValue().then((v) => live && setValue(v));
    const unwatch = item.watch((v) => setValue(v));
    return () => {
      live = false;
      unwatch();
    };
  }, [item]);
  return value;
}
