import { useSyncExternalStore, useMemo, useEffect } from "react";
import DataState from "./DataState.mjs";

const useDataState = (name) => {
  const [listener, unRegister] = useMemo(
    () => DataState.createReactBusListener(name),
    [name]
  );
  const stateValue = useSyncExternalStore(
    listener,
    () => DataState.getComplete(name),
    [name]
  );
  useEffect(() => {
    if (unRegister)
      return () => {
        unRegister(listener);
      };
  }, [unRegister]);

  return stateValue?.v;
};
export default useDataState;
