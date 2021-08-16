import { MatchExpression } from 'console-sdk-ai-lib';
import { AGENT_LOCATION_LABEL_KEY } from '../common';

export const getLocationsFormMatchExpressions = (expressions: MatchExpression[] = []) =>
  expressions.find((expr) => expr.key === AGENT_LOCATION_LABEL_KEY)?.values || [];
