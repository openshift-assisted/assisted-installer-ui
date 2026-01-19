import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { DispatchDay1, RootStateDay1 } from './store-day1';

export const useDispatchDay1 = useDispatch<DispatchDay1>;
export const useSelectorDay1: TypedUseSelectorHook<RootStateDay1> = useSelector;
