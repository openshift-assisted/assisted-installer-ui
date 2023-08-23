declare module 'global-augmentations' {
  global {
    interface Window {
      __app__: { OCM: typeof import('@openshift-assisted/ui-lib/ocm') };
    }
  }
}
