import { hasWizardSignal } from '../utils';
import * as fixtures from '../../fixtures';
import {
  allClustersApiPath,
  allInfraEnvsApiPath,
  arm,
  day2InfraEnvDetailsUrl,
  getCpuArchitectureParam,
  getDay1ClusterApiPath,
  getDay1InfraEnvApiPath,
  getDay2ClusterApiPath,
  getDay2InfraEnv,
  getDay2InfraEnvApiPath,
  x86,
} from './utils';

const { day2FlowIds } = fixtures;

const getDay2InfraEnvByCpuArch = (req) => {
  let infraEnv;
  if (req.url === getDay2InfraEnvApiPath(arm)) {
    infraEnv = getDay2InfraEnv(arm);
  } else {
    infraEnv = getDay2InfraEnv(x86);
  }
  req.reply(infraEnv);
};

export const addDay2ClusterIntercepts = () => {
  const day1ClusterApiPath = getDay1ClusterApiPath();
  const day2ClusterApiPath = getDay2ClusterApiPath();

  cy.intercept(
    'GET',
    `${allClustersApiPath}?openshift_cluster_id=${day2FlowIds.day1.aiClusterId}`,
    (req) => {
      const fixture = hasWizardSignal('CREATED_DAY2_CLUSTER') ? [fixtures.day2AiCluster] : [];
      req.reply(fixture);
    },
  ).as('find-associated-day2-cluster');

  cy.intercept('POST', `${allClustersApiPath}/import`, (req) => {
    expect(req.body).to.include({
      openshift_cluster_id: day2FlowIds.day1.aiClusterId,
      openshift_version: '4.12',
      name: 'scale-up-day2-flow',
      api_vip_dnsname: 'console-openshift-console.apps.day2-flow.redhat.com',
    });
    req.reply({ body: fixtures.day2AiCluster, delay: 1200 }); // add some delay
  }).as('create-day2-cluster');

  cy.intercept('GET', day1ClusterApiPath, (req) => {
    req.reply(fixtures.day1OcmSubscription);
  }).as('cluster-details');

  cy.intercept('GET', day2ClusterApiPath, (req) => {
    req.reply(fixtures.day2AiCluster);
  }).as('day2-cluster-details');
};

export const addDay2InfraEnvIntercepts = () => {
  // Actions on an individual infraEnv (for Day2 cluster, they are associated to a particular cpu_architecture)
  const day1InfraEnvApiPath = getDay1InfraEnvApiPath();
  cy.intercept('GET', day1InfraEnvApiPath, fixtures.day1InfraEnv).as('day1-infra-env-details');
  cy.intercept('GET', day2InfraEnvDetailsUrl, getDay2InfraEnvByCpuArch).as(
    'day2-infra-env-details',
  );
  cy.intercept('PATCH', day2InfraEnvDetailsUrl, getDay2InfraEnvByCpuArch).as(
    'update-day2-infra-env',
  );

  // Actions on all the infraEnvs
  cy.intercept('GET', `${allInfraEnvsApiPath}?cluster_id=*`, (req) => {
    const clusterId = req.query.cluster_id as string;
    let infraEnvs = [];

    if (clusterId === day2FlowIds.day1.ocmClusterId) {
      // The Day1 cluster has a single infraEnv
      infraEnvs = [fixtures.day1InfraEnv];
    } else {
      // The Day2 cluster can have more than 1 infraEnvs, each for a different CPU architecture
      const cpuArchitecture = getCpuArchitectureParam(req.query.cpu_architecture as string);
      const x86InfraEnv = getDay2InfraEnv(x86);
      const armInfraEnv = getDay2InfraEnv(arm);
      if (hasWizardSignal('ADDED_SECOND_CPU_ARCHITECTURE')) {
        if (cpuArchitecture) {
          infraEnvs = [getDay2InfraEnv(cpuArchitecture)]; // We're filtering the infraEnvs by cpuArchitecture
        } else {
          infraEnvs = [x86InfraEnv, armInfraEnv]; // We're looking for all the existing infraEnvs
        }
      } else if (hasWizardSignal('CREATED_DAY2_CLUSTER')) {
        infraEnvs = [x86InfraEnv]; // This simulates the first time the tab is accessed, where only the first infraEnv is created
      }
    }
    req.reply(infraEnvs);
  }).as('find-day2-flow-infra-envs');

  cy.intercept('POST', `${allInfraEnvsApiPath}`, (req) => {
    expect(req.body).to.include({
      cluster_id: day2FlowIds.day2.aiClusterId,
      openshift_version: '4.12',
    });
    // TODO can be empty¿?¿¿
    const cpuArch = getCpuArchitectureParam(req.body.cpu_architecture as string);
    req.reply(getDay2InfraEnv(cpuArch));
  }).as('create-day2-infra-env');
};
