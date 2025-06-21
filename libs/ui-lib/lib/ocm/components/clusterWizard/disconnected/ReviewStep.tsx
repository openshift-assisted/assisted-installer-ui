import * as React from 'react';
import ClusterWizardFooter from '../ClusterWizardFooter';
import { useClusterWizardContext } from '../ClusterWizardContext';
import { ClusterWizardStep, singleClusterOperators, TechnologyPreview } from '../../../../common';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import {
  Split,
  SplitItem,
  Alert,
  Grid,
  Text,
  TextContent,
  TextVariants,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  List,
  ListItem,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import { getOperatorSpecs } from '../../../../common/components/operators/operatorSpecs';

const ReviewStep = () => {
  const { moveNext, moveBack } = useClusterWizardContext();
  const opSpecs = getOperatorSpecs();

  return (
    <Formik
      initialValues={{}}
      onSubmit={() => {
        // nothing to do
      }}
    >
      <ClusterWizardStep
        navigation={<ClusterWizardNavigation />}
        footer={
          <ClusterWizardFooter onNext={moveNext} onBack={moveBack} nextButtonText="Download ISO" />
        }
      >
        <WithErrorBoundary title="Failed to load Review step">
          <Grid hasGutter>
            <Split>
              <SplitItem>
                <TextContent>
                  <Text component={TextVariants.h2}>Review and download ISO</Text>
                </TextContent>
              </SplitItem>
              <SplitItem>
                <TechnologyPreview />
              </SplitItem>
            </Split>
            <Alert isInline variant="info" title="Discovery ISO boot instructions" />
            <Alert isInline variant="info" title="List of available operators">
              <List>
                {singleClusterOperators.map((o) => (
                  <ListItem key={o}>{opSpecs[o] ? opSpecs[o].title : o}</ListItem>
                ))}
              </List>
            </Alert>
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>OpenShift version</DescriptionListTerm>
                <DescriptionListDescription>4.19</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>CPU architecture</DescriptionListTerm>
                <DescriptionListDescription>x86_64</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>ISO size</DescriptionListTerm>
                <DescriptionListDescription>approx. 35GB</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </Grid>
        </WithErrorBoundary>
      </ClusterWizardStep>
    </Formik>
  );
};

export default ReviewStep;
