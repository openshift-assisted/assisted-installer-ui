import React from 'react';
import {
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, InnerScrollContainer } from '@patternfly/react-table';
import { getHumanizedDateTime, LoadingState, useTranslation } from '../../../common';
import { useEvents } from '../../hooks';

export const BMHEventsModal = ({
  isOpen,
  onClose,
  namespace,
  bmhName,
}: {
  isOpen: boolean;
  onClose: () => void;
  namespace: string;
  bmhName: string;
}) => {
  const { t } = useTranslation();
  const [events, loaded, error] = useEvents({
    namespace: namespace,
    isList: true,
    fieldSelector: `involvedObject.name=${bmhName}`,
  });

  let modalBody: React.ReactNode;
  if (!loaded) {
    modalBody = <LoadingState />;
  } else if (error) {
    modalBody = <Content component={ContentVariants.p}>{error as string}</Content>;
  } else if (!events.length) {
    modalBody = <Content component={ContentVariants.p}>{t('ai:No BMH events found.')}</Content>;
  } else {
    modalBody = (
      <div style={{ height: '400px' }}>
        <InnerScrollContainer>
          <Table
            variant="compact"
            borders={false}
            className="pf-v6-u-mb-sm"
            gridBreakPoint=""
            isStickyHeader
          >
            <Thead>
              <Tr>
                <Th>{t('ai:Time')}</Th>
                <Th>{t('ai:Type')}</Th>
                <Th>{t('ai:Message')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events
                .sort(
                  (a, b) =>
                    a.metadata?.creationTimestamp?.localeCompare(
                      b.metadata?.creationTimestamp || '',
                    ) || 0,
                )
                .map((e, i) => (
                  <Tr key={`bmc-event-${i}`}>
                    <Td className="pf-v6-u-font-weight-bold">
                      {getHumanizedDateTime(e.metadata?.creationTimestamp)}
                    </Td>
                    <Td>{e.type}</Td>
                    <Td>{e.message}</Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </InnerScrollContainer>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.medium}>
      <ModalHeader title={t('ai:Bare metal host events')} />
      <ModalBody>{modalBody}</ModalBody>
    </Modal>
  );
};
