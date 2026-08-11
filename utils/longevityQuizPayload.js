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

/**
 * Reverse of buildLongevityCrmFormPayload: rebuild the quiz `answers` object
 * (keyed by step `field`) from a CRM answer set returned by
 * /api/questionnaire-filled-answers. Used to resume an incomplete quiz opened
 * from the patient portal, mirroring the ED/WL/hair prefill. Only fields the
 * CRM actually has are set; anything unrecognised is skipped.
 */
export function mapLongevityCrmAnswers(crmData, quizConfig) {
  const answers = {};
  if (!crmData || typeof crmData !== "object") return answers;

  // CRM returns keys dot-notated (e.g. "1205.1", "product.name"); normalise to
  // the underscore form the config uses for option ids and crmFields.
  const norm = {};
  for (const [k, v] of Object.entries(crmData)) {
    norm[String(k).replace(/\./g, "_")] = v;
  }
  const has = (key) => key != null && norm[key] !== undefined;
  const eq = (a, b) =>
    String(a ?? "").trim().toLowerCase() ===
    String(b ?? "").trim().toLowerCase();
  const matchOption = (step, value) =>
    (step.options || []).find(
      (o) => eq(o.crmValue ?? o.label, value) || eq(o.id, value),
    );

  const steps = quizConfig?.steps || {};
  for (const step of Object.values(steps)) {
    if (!step?.field) continue;

    if (step.type === "id-upload") {
      const key = step.crmField || "196";
      if (has(key)) answers[step.field] = norm[key];
      continue;
    }

    if (step.type === "radio-text") {
      if (!has(step.crmField)) continue;
      const opt = matchOption(step, norm[step.crmField]);
      if (opt) {
        answers[step.field] = opt.id;
        if (opt.showTextInput && step.textField && has(step.textCrmField)) {
          answers[step.textField] = norm[step.textCrmField];
        }
      }
      continue;
    }

    if (step.crmSubfieldRadio) {
      // Selected option ids are themselves the CRM keys.
      const selected = (step.options || [])
        .filter((o) => has(o.id))
        .map((o) => o.id);
      if (!selected.length) continue;
      answers[step.field] =
        step.type === "checkbox" ? selected : selected[0];
      continue;
    }

    if (step.crmField && has(step.crmField)) {
      const opt = matchOption(step, norm[step.crmField]);
      answers[step.field] = opt ? opt.id : norm[step.crmField];
    }
  }

  return answers;
}
