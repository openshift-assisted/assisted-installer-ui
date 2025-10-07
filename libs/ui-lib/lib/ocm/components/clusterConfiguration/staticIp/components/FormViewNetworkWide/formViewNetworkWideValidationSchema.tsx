import * as Yup from 'yup';

import { FormViewNetworkWideValues } from '../../data/dataTypes';
import {
  getDNSValidationSchema,
  ipConfigsValidationSchemas,
  VlanIdValidationSchema,
} from '../../../../../../common';
import { TFunction } from 'i18next';

export const networkWideValidationSchema = (t: TFunction) =>
  Yup.lazy((values: FormViewNetworkWideValues) => {
    return Yup.object({
      useVlan: Yup.boolean(),
      vlanId: Yup.mixed().when('useVlan', {
        is: (useVlan: boolean) => useVlan,
        then: () => VlanIdValidationSchema(values.vlanId, t),
      }),
      protocolType: Yup.string(),
      dns: getDNSValidationSchema(values.protocolType, t),
      ipConfigs: ipConfigsValidationSchemas(values.ipConfigs, values.protocolType, t),
    });
  });
