import classNames from 'classnames';
import React from 'react';
import ClusterDetails from './ClusterDetails';

const NewClusterWizard: React.FC = () => {
  return (
    <div className={classNames('pf-v6-c-wizard', 'cluster-wizard')}>
      <ClusterDetails />
    </div>
  );
};

export default NewClusterWizard;
