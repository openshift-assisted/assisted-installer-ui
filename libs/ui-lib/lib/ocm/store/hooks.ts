import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { DispatchDay1, RootStateDay1 } from './store-day1';
import type { DispatchDay2, RootStateDay2 } from './store-day2';

export const useDispatchDay1: () => DispatchDay1 = useDispatch;
export const useSelectorDay1: TypedUseSelectorHook<RootStateDay1> = useSelector;
export const useDispatchDay2: () => DispatchDay2 = useDispatch;
export const useSelectorDay2: TypedUseSelectorHook<RootStateDay2> = useSelector;
