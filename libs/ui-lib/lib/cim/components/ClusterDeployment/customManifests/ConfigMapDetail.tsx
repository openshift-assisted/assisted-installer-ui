import React from 'react';
import {
  Alert,
  Bullseye,
  Button,
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Spinner,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { ExternalLink, useTranslation } from '../../../../common';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { ConfigMapK8sResource } from '../../../types';
import { useField } from 'formik';

const ExpandedConfigMap = ({
  index,
  configMap,
}: {
  index: number;
  configMap?: ConfigMapK8sResource;
}) => {
  const { t } = useTranslation();
  const [, { error: isValidError }] = useField<boolean>(`configMaps.${index}.valid`);
  const [, { error: manifestNamesError }] = useField<string[]>(`configMaps.${index}.manifestNames`);

  return isValidError ? (
    <GridItem>
      <Label variant="outline" icon={<InfoCircleIcon />} color="red">
        {isValidError}
      </Label>
    </GridItem>
  ) : (
    <>
      <GridItem>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('ai:Name')}</DescriptionListTerm>
            <DescriptionListDescription>{configMap?.metadata?.name}</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('ai:Namespace')}</DescriptionListTerm>
            <DescriptionListDescription>
              {configMap?.metadata?.namespace}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('ai:Data')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Grid hasGutter>
                <GridItem>
                  <ExternalLink
                    href={`/k8s/ns/${configMap?.metadata?.namespace || ''}/configmaps/${
                      configMap?.metadata?.name || ''
                    }/form`}
                  >
                    {t('ai:Edit config map data')}
                  </ExternalLink>
                </GridItem>

                {Object.entries(configMap?.data || {}).map(([key, val]) => (
                  <GridItem key={key}>
                    <Text component={TextVariants.h4}>{key}</Text>
                    <CodeBlock>
                      <CodeBlockCode>{val}</CodeBlockCode>
                    </CodeBlock>
                  </GridItem>
                ))}
              </Grid>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </GridItem>

      {manifestNamesError && (
        <GridItem>
          <Alert title={manifestNamesError} variant="danger" isInline />
        </GridItem>
      )}
    </>
  );
};

const CollapsedConfigMap = ({
  index,
  configMap,
}: {
  index: number;
  configMap?: ConfigMapK8sResource;
}) => {
  const [, { error: isValidError }] = useField<boolean>(`configMaps.${index}.valid`);
  const [, { error: manifestNamesError }] = useField<string[]>(`configMaps.${index}.manifestNames`);

  const { t } = useTranslation();

  return (
    <GridItem>
      {isValidError || manifestNamesError ? (
        <Label variant="outline" icon={<InfoCircleIcon />} color="red">
          {isValidError || manifestNamesError}
        </Label>
      ) : (
        <Label variant="outline" icon={<InfoCircleIcon />}>
          {t('ai:{{count}} entry', { count: Object.entries(configMap?.data || {}).length })}
        </Label>
      )}
    </GridItem>
  );
};

export const ConfigMapDetail = ({
  index,
  configMapName,
  configMap,
  onRemove,
  isLoading,
}: {
  index: number;
  configMapName: string;
  configMap?: ConfigMapK8sResource;
  onRemove: () => void;
  isLoading: boolean;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showRemoveButton, setShowRemoveButton] = React.useState(false);

  return (
    <GridItem>
      <Grid
        onMouseEnter={() => setShowRemoveButton(true)}
        onMouseLeave={() => setShowRemoveButton(false)}
        hasGutter
      >
        <GridItem>
          <Flex>
            <FlexItem>
              <ExpandableSectionToggle
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
                direction="down"
              >
                {configMapName}
              </ExpandableSectionToggle>
            </FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              <Button
                aria-label="remove config map"
                style={{ visibility: showRemoveButton ? 'visible' : 'hidden' }}
                variant="plain"
                onClick={onRemove}
              >
                <MinusCircleIcon />
              </Button>
            </FlexItem>
          </Flex>
        </GridItem>

        {isLoading ? (
          <GridItem>
            <Bullseye>
              <Spinner size="lg" />
            </Bullseye>
          </GridItem>
        ) : isExpanded ? (
          <ExpandedConfigMap configMap={configMap} index={index} />
        ) : (
          <CollapsedConfigMap configMap={configMap} index={index} />
        )}

        <GridItem>
          <Divider />
        </GridItem>
      </Grid>
    </GridItem>
  );
};
