import { useEffect } from "react";

export default function useEffectAsync(callback: () => Promise<any>, deps: React.DependencyList) {
  return useEffect(() => {
    callback();
  }, deps);
}
