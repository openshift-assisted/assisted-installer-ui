import { combineReducers } from 'redux';
import clustersReducer from '../features/clusters/clustersSlice';
import currentClusterReducer from '../features/clusters/currentClusterSlice';

const rootReducer = combineReducers({
  clusters: clustersReducer,
  currentCluster: currentClusterReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
