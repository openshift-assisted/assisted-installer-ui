export const CLUSTER_NAME_VALIDATION_MESSAGES = {
  INVALID_LENGTH: '1-54 characters',
  INVALID_VALUE: 'Use lowercase alphanumberic characters, or hyphen (-)',
  INVALID_START_END: 'Start and end with a lowercase letter or a number.',
};

export const UNIQUE_CLUSTER_NAME_VALIDATION_MESSAGES = {
  ...CLUSTER_NAME_VALIDATION_MESSAGES,
  NOT_UNIQUE: 'Must be unique',
};

export const NAME_VALIDATION_MESSAGES = {
  INVALID_LENGTH: '1-253 characters',
  NOT_UNIQUE: 'Must be unique',
  INVALID_VALUE: 'Use lowercase alphanumberic characters, dot (.) or hyphen (-)',
  INVALID_START_END: 'Must start and end with an lowercase alphanumeric character',
  INVALID_FORMAT: 'Number of characters between dots (.) must be 1-63',
};

export const HOSTNAME_VALIDATION_MESSAGES = {
  ...NAME_VALIDATION_MESSAGES,
  LOCALHOST_ERR: 'Cannot be the word "localhost" or "localhost.localdomain"',
};

export const LOCATION_VALIDATION_MESSAGES = {
  INVALID_LENGTH: '1-63 characters',
  INVALID_VALUE: 'Use alphanumberic characters, dot (.), underscore (_) or hyphen (-)',
  INVALID_START_END: 'Must start and end with an alphanumeric character',
};
