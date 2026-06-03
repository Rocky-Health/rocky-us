/**
 * Maps longevity quiz answers + step config to flat CRM form field keys.
 */

function findOption(step, optionId) {
  return (step.options || []).find((o) => o.id === optionId);
}

function setExclusiveSubfield(form, optionId, opt, step) {
  if (step.exclusiveOptions?.includes(optionId)) {
    form[optionId] = opt.crmValue ?? "No";
  } else {
    form[optionId] = opt.label ?? opt.crmValue ?? optionId;
  }
}

export function buildLongevityCrmFormPayload(answers, quizConfig) {
  const form = {};
  const steps = quizConfig?.steps || {};
  const data = answers || {};

  const productName = quizConfig?.productName;
  if (productName) {
    form.product_name = productName;
    form["product.name"] = productName;
  }

  for (const step of Object.values(steps)) {
    if (!step || step.type === "id-upload") continue;

    const value = data[step.field];
    const hasValue =
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0);
    if (!hasValue) continue;

    if (step.type === "radio-text") {
      const opt = findOption(step, value);
      if (step.crmField && opt) {
        form[step.crmField] = opt.crmValue ?? opt.label;
      }
      if (step.textCrmField && step.textField) {
        const selected = findOption(step, value);
        if (selected?.showTextInput && data[step.textField]) {
          form[step.textCrmField] = data[step.textField];
        }
      }
      continue;
    }

    if (step.type === "radio") {
      if (step.crmSubfieldRadio) {
        const opt = findOption(step, value);
        if (opt) setExclusiveSubfield(form, opt.id, opt, step);
      } else if (step.crmField) {
        const opt = findOption(step, value);
        if (opt) form[step.crmField] = opt.crmValue ?? opt.label;
      }
      continue;
    }

    if (step.type === "checkbox" && step.crmSubfieldRadio) {
      const selected = Array.isArray(value) ? value : [value];
      for (const optionId of selected) {
        const opt = findOption(step, optionId);
        if (opt) setExclusiveSubfield(form, opt.id, opt, step);
      }
      continue;
    }

    if (step.crmField) {
      form[step.crmField] =
        typeof value === "string" ? value : JSON.stringify(value);
    }
  }

  const uploadStep = Object.values(steps).find((s) => s?.type === "id-upload");
  if (data.photoIdUrl) {
    const crmField = uploadStep?.crmField || "196";
    form[crmField] = data.photoIdUrl;
  }

  return form;
}
