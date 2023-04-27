export const VERSION = process.env.AIUI_APP_VERSION;
export const GIT_SHA = process.env.AIUI_APP_GIT_SHA;
export const IMAGE_REPO = process.env.AIUI_APP_IMAGE_REPO;

export const SERVICE_LABELS: { [key in string]: string } = {
  assistedInstaller: 'Assisted Installer',
  assistedInstallerController: 'Assisted Installer Controller',
  assistedInstallerAgent: 'Assisted Installer Agent',
  assistedService: 'Assisted Installer Service',
  discoveryAgent: 'Discovery Agent',
  ignitionManifestsAndKubeconfigGenerate: 'Ignition Manifests and Kubeconfig Generate',
  imageBuilder: 'Image Builder',
};
