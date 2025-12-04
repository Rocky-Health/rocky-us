export const getProductRecommendation = (answers, rules) => {
  for (const rule of rules) {
    const { conditions, outcome } = rule;
    const isMatch = Object.keys(conditions).every((field) => {
      const expectedValue = conditions[field];
      const actualValue = answers[field];

      if (Array.isArray(expectedValue)) {
        return expectedValue.includes(actualValue);
      }

      return actualValue === expectedValue;
    });

    if (isMatch) {
      return outcome;
    }
  }

  return null;
};
