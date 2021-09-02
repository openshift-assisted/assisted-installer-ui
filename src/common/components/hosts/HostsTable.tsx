import * as React from 'react';
import { Host } from '../../../common';
import AITable, {
  ActionsResolver,
  ExpandComponentProps,
  TableRow,
} from '../../../common/components/hosts/AITable';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { AdditionalNTPSourcesDialogToggle } from '../../../ocm/components/hosts/AdditionaNTPSourceDialogToggle';
import { getHostId } from '../../../ocm/components/hosts/use-hosts-table';
import { WithTestID } from '../../types';

export const DefaultExpandComponent: React.FC<ExpandComponentProps<Host>> = ({ obj }) => (
  <HostDetail
    key={obj.id}
    host={obj}
    AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
  />
);

type HostsTableProps = {
  hosts: Host[];
  skipDisabled?: boolean;
  content: TableRow<Host>[];
  actionResolver: ActionsResolver<Host>;
  children: React.ReactNode;
  onSelect?: (obj: Host, isSelected: boolean) => void;
  selectedIDs?: string[];
  ExpandComponent?: React.ComponentType<ExpandComponentProps<Host>>;
  className?: string;
};

const HostsTable: React.FC<HostsTableProps & WithTestID> = ({
  hosts,
  skipDisabled,
  children,
  content,
  actionResolver,
  ExpandComponent = DefaultExpandComponent,
  className,
  testId,
  onSelect,
  selectedIDs,
}) => {
  const data = (hosts || []).filter((host) => !skipDisabled || host.status != 'disabled');

  return (
    <AITable<Host>
      getDataId={getHostId}
      data={data}
      ExpandComponent={ExpandComponent}
      content={content}
      actionResolver={actionResolver}
      className={className}
      testId={testId}
      onSelect={onSelect}
      selectedIDs={selectedIDs}
    >
      {children}
    </AITable>
  );
};

export default HostsTable;
