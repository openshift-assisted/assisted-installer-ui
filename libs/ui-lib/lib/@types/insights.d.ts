declare interface Insights {
  chrome: import('@redhat-cloud-services/types').ChromeAPI;
}

interface Window {
  insights?: Insights;
}
