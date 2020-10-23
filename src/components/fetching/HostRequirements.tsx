import React from 'react';
import {
  HostRequirementsRole,
  HostRequirements as HostRequirementsType,
  handleApiError,
  getErrorMessage,
} from '../../api';
import { getHostRequirements } from '../../api/hostRequirements';
import { addAlert } from '../../features/alerts/alertsSlice';

const HostRequirements: React.FC<{
  ContentComponent: React.FC<{ worker?: HostRequirementsRole; master?: HostRequirementsRole }>;
}> = ({ ContentComponent }) => {
  const [hostRequirements, setHostRequirements] = React.useState<HostRequirementsType>();

  React.useEffect(() => {
    const fetchFunc = async () => {
      try {
        const { data } = await getHostRequirements();
        setHostRequirements(data);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve minimum host requierements',
            message: getErrorMessage(e),
          }),
        );
      }
    };
    fetchFunc();
  }, [setHostRequirements]);

  return <ContentComponent {...hostRequirements} />;
};

export default HostRequirements;
