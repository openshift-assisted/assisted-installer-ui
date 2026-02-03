export const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

export const CLUSTER_NAME_START_END_REGEX = /^[a-z0-9](.*[a-z0-9])?$/;
export const CLUSTER_NAME_VALID_CHARS_REGEX = /^[a-z0-9-]*$/;

export const DNS_NAME_REGEX = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
export const NAME_START_END_REGEX = /^[a-z0-9](.*[a-z0-9])?$/;
export const NAME_CHARS_REGEX = /^[a-z0-9-.]*$/;

export const HOST_NAME_REGEX = /^[^.]{1,63}(?:[.][^.]{1,63})*$/;
export const SSH_PUBLIC_KEY_REGEX =
  /^(ssh-rsa AAAAB3NzaC1yc2|ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNT|ecdsa-sha2-nistp384 AAAAE2VjZHNhLXNoYTItbmlzdHAzODQAAAAIbmlzdHAzOD|ecdsa-sha2-nistp521 AAAAE2VjZHNhLXNoYTItbmlzdHA1MjEAAAAIbmlzdHA1Mj|ssh-ed25519 AAAAC3NzaC1lZDI1NTE5|ssh-dss AAAAB3NzaC1kc3)[0-9A-Za-z+/]+[=]{0,3}( .*)?$/;

export const PROXY_DNS_REGEX =
  /(^\.?([a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62}){1}(\.[a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62})*$)/;

export const IP_V4_ZERO = '0.0.0.0';
export const IP_V6_ZERO = '0000:0000:0000:0000:0000:0000:0000:0000';

export const MAC_REGEX = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;

export const LOCATION_CHARS_REGEX = /^[a-zA-Z0-9-._]*$/;
