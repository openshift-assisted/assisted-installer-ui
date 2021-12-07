import { Error as APIError, InfraError } from '../../common/api/types';

export type APIErrorMixin = InfraError & APIError;
