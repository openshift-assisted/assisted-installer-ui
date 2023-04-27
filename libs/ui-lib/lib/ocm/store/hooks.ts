import type { DispatchDay1, DispatchDay2 } from './index';
import { useDispatch } from 'react-redux';

export const useDispatchDay1: () => DispatchDay1 = useDispatch;
export const useDispatchDay2: () => DispatchDay2 = useDispatch;
