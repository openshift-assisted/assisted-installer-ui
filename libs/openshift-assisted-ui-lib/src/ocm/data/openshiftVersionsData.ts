type SupportVersionsData = {
  'dates format': string;
  versions: Record<string, string>;
};

const data: SupportVersionsData = {
  'dates format': 'name-of-month DD, YYYY',
  versions: {
    '4.8': 'January 27, 2023',
    '4.7': 'August 24, 2022',
    '4.6': 'October 27, 2022',
  },
} as const;

export default data;
