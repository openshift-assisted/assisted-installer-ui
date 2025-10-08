import * as Yup from 'yup';

export type UniqueStringArrayExtractor<FormValues> = (
  values: FormValues,
  context: Yup.TestContext,
  value: string,
) => string[] | undefined;

export const getUniqueValidationSchema = <FormValues,>(
  uniqueStringArrayExtractor: UniqueStringArrayExtractor<FormValues>,
) => {
  return Yup.string().test(
    'unique',
    'Value must be unique',
    (value, testContext: Yup.TestContext) => {
      const context = testContext.options.context as Yup.TestContext & { values?: FormValues };
      if (!context || !context.values) {
        return testContext.createError({
          message: 'Unexpected error: Yup test context should contain form values',
        });
      }

      const values = uniqueStringArrayExtractor(context.values, testContext, value as string);

      if (!values) {
        return testContext.createError({
          message: 'Unexpected error: Failed to get values to test uniqueness',
        });
      }
      return (
        values.filter((currentValue) => currentValue.toLowerCase() === value?.toLowerCase())
          .length === 1
      );
    },
  );
};
