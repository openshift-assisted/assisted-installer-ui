let _version = 2;

const APIVersionService = {
  get version() {
    return _version;
  },

  set version(version: number) {
    _version = parseInt(String(version));
  },
};

export default APIVersionService;
