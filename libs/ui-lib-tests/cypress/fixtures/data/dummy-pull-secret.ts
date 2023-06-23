const pullSecret = JSON.stringify({
  auths: {
    'cloud.openshift.com': {
      auth: 'test',
      email: 'some-user@redhat.com',
    },
  },
});

export { pullSecret };
