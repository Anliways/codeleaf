import { useRef, useState } from 'react';

/**
 * 带撤销/重做历史的状态管理 Hook。
 * - set：更新状态并记录历史（快速连续输入会自动合并为一条记录）
 * - undo / redo：回退 / 重做
 * - canUndo / canRedo：是否有可撤销 / 重做的操作
 */
export function useHistory<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const stateRef = useRef<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const lastPushAt = useRef(0);
  const [, force] = useState(0);

  const commit = (value: T) => {
    const prev = stateRef.current;
    if (value === prev) return;
    const now = Date.now();
    const coalesce = now - lastPushAt.current < 700 && past.current.length > 0;
    if (!coalesce) {
      past.current.push(prev);
      if (past.current.length > 200) past.current.shift();
      future.current = [];
    }
    lastPushAt.current = now;
    stateRef.current = value;
    setState(value);
    force((n) => n + 1);
  };

  const set = (next: T | ((prev: T) => T)) => {
    const value =
      typeof next === 'function' ? (next as (p: T) => T)(stateRef.current) : next;
    commit(value);
  };

  const undo = () => {
    if (past.current.length === 0) return;
    const current = stateRef.current;
    const previous = past.current.pop() as T;
    future.current.push(current);
    lastPushAt.current = 0;
    stateRef.current = previous;
    setState(previous);
    force((n) => n + 1);
  };

  const redo = () => {
    if (future.current.length === 0) return;
    const current = stateRef.current;
    const next = future.current.pop() as T;
    past.current.push(current);
    lastPushAt.current = 0;
    stateRef.current = next;
    setState(next);
    force((n) => n + 1);
  };

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return { state, set, undo, redo, canUndo, canRedo };
}