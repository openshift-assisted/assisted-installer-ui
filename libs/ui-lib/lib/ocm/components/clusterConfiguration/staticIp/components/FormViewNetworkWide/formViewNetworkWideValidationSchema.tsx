import * as Yup from 'yup';

import { FormViewNetworkWideValues } from '../../data/dataTypes';
import {
  getDNSValidationSchema,
  ipConfigsValidationSchemas,
  VlanIdValidationSchema,
} from '../../../../../../common';

export const networkWideValidationSchema = Yup.lazy((values: FormViewNetworkWideValues) => {
  return Yup.object({
    useVlan: Yup.boolean(),
    vlanId: Yup.mixed().when('useVlan', {
      is: (useVlan: boolean) => useVlan,
      then: () => VlanIdValidationSchema(values.vlanId),
    }),
    protocolType: Yup.string(),
    dns: getDNSValidationSchema(values.protocolType),
    ipConfigs: ipConfigsValidationSchemas(values.ipConfigs, values.protocolType),
  });
});
