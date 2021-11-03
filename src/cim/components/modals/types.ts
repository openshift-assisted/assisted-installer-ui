import { BMCFormProps } from '../Agent/types';

export type AddHostModalProps = Pick<BMCFormProps, 'onClose' | 'onCreate' | 'infraEnv'> & {
  isOpen: boolean;
  isBMPlatform: boolean;
};
