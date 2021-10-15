import { Error as APIError, InfraError } from '../../common';

export type APIErrorMixin = InfraError & APIError;
