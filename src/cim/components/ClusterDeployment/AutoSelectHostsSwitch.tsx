import { useField } from 'formik';
import React from 'react';
import { SwitchField } from '../../../common';
import ConfirmationModal from '../../../common/components/ui/ConfirmationModal';

const AutoSelectHostsSwitch: React.FC = () => {
  const [{ value: autoSelectHosts }, , { setValue: setAutoSelectHosts }] = useField(
    'autoSelectHosts',
  );
  const [{ value: agentLabels }, , { setValue: setAgentLabels }] = useField('agentLabels');
  const [{ value: selectedHostIds }, , { setValue: setSelectedHostIds }] = useField(
    'selectedHostIds',
  );

  const [isConfirmAutoSelectHostsSwitchOpen, setConfirmAutoSelectHostsSwitch] = React.useState(
    false,
  );

  const onChangeCustomOverride =
    !autoSelectHosts && (agentLabels.length > 0 || selectedHostIds.length > 0)
      ? () => {
          setConfirmAutoSelectHostsSwitch(true);
        }
      : undefined;

  const onAutoSelectConfirmed = () => {
    setAutoSelectHosts(!autoSelectHosts);
    setAgentLabels([]);
    setSelectedHostIds([]);
    setConfirmAutoSelectHostsSwitch(false);
  };

  return (
    <>
      <SwitchField
        name="autoSelectHosts"
        label="Auto-select hosts"
        onChangeCustomOverride={onChangeCustomOverride}
      />

      {isConfirmAutoSelectHostsSwitchOpen && (
        <ConfirmationModal
          title="Renounce labels and hosts selection"
          content={
            <>
              By changing the view, entered hosts selection and labels will be lost.
              <br />
              Do you want to continue?
            </>
          }
          onClose={() => setConfirmAutoSelectHostsSwitch(false)}
          onConfirm={onAutoSelectConfirmed}
        />
      )}
    </>
  );
};

export default AutoSelectHostsSwitch;
