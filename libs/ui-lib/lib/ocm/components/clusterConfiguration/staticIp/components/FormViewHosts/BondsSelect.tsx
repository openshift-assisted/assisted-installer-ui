import React from 'react';
import { SelectFieldProps } from '../../../../../../common/components/ui/formik/types';
import { SelectField } from '../../../../../../common';

type BondsSelectProps = {
  onChange?: SelectFieldProps['onChange'];
  id: string;
};

const bondsList = [
  { value: 'balance-rr', label: 'Balance-rr(0)', default: false },
  { value: 'active-backup', label: 'Active-Backup(1)', default: true },
  { value: 'balance-xor', label: 'Balance-xor(2)', default: false },
  { value: 'broadcast', label: 'Broadcast(3)', default: false },
  { value: '802.3ad', label: '802.3ad(4)', default: false },
  { value: 'balance-tlb', label: 'Balance-tlb(5)', default: false },
  { value: 'balance-alb', label: 'Balance-alb(6)', default: false },
];
const BondsSelect: React.FC<BondsSelectProps> = ({ onChange, id }) => {
  const selectOptions = React.useMemo(
    () =>
      bondsList.map((version) => ({
        label: version.label,
        value: version.value,
        selected: version.default,
      })),
    [],
  );
  return (
    <SelectField
      name={id}
      label="Bond type"
      options={selectOptions}
      isRequired
      onChange={onChange}
    />
  );
};

export default BondsSelect;
