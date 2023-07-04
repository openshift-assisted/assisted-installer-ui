const dummyManifest = {
  file_name: 'manifest1.yaml',
  folder: 'manifests',
};

export const customManifests = [dummyManifest];

export const customManifestContent = `
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: docs-template
  title: Documentation Template
  description: Create a new standalone documentation project
  tags:
    - recommended
    - techdocs
    - mkdocs
     `;
