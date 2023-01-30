export const labelsToFormikValue = (labels: { [key: string]: string }) =>
  Object.keys(labels).map((key) => ({
    key,
    value: labels[key],
  }));

export const formikLabelsToLabels = (labels: { key: string; value: string }[]) =>
  labels.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
