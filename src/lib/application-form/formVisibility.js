function matchCondition(condition, values) {
  if (!condition || typeof condition !== 'object') {
    return true
  }
  if (Array.isArray(condition.and)) {
    return condition.and.every((c) => matchCondition(c, values))
  }
  if (Array.isArray(condition.or)) {
    return condition.or.some((c) => matchCondition(c, values))
  }

  const value = values[condition.field]
  if (condition.equals !== undefined) {
    return value === condition.equals
  }
  if (condition.notEquals !== undefined) {
    return value !== condition.notEquals
  }
  if (condition.notIn) {
    return !condition.notIn.includes(value)
  }
  if (condition.anyOf) {
    return condition.anyOf.includes(value)
  }
  return true
}

export function isFieldVisible(field, values) {
  if (!field.showWhen) {
    return true
  }
  return matchCondition(field.showWhen, values)
}

export function normalizeSelectOptions(options) {
  if (!options?.length) {
    return []
  }
  if (typeof options[0] === 'object' && options[0] !== null && 'value' in options[0]) {
    return options
  }
  return options.map((option) => ({ value: option, label: option }))
}

export function getSelectValues(options) {
  return normalizeSelectOptions(options).map((o) => String(o.value))
}
