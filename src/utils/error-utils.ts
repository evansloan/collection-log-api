import { CheckViolationError, DBError, NotNullViolationError, UniqueViolationError } from 'objection';

const ERROR_MESSAGE_PATTERNS: { [key: string]: string } = {
  CheckViolationError: '{model} {column} does not fit within the constraints',
  NotNullViolationError: '{model} {column} cannot be empty',
  UniqueViolationError: '{model} already exists with {column}',
};

export const parseModelValidationError = (error: typeof DBError, modelName: string) => {
  const type = error.name;
  let columns: string[] = [];

  if (error instanceof UniqueViolationError) {
    columns = error.columns;
  }

  if (error instanceof NotNullViolationError) {
    columns = [error.column];
  }

  if (error instanceof CheckViolationError) {
    columns = [parseConstraint(error.constraint, modelName)];
  }

  const messagePattern = ERROR_MESSAGE_PATTERNS[type];

  return messagePattern.replace(/{model}/g, modelName)
    .replace(/{column}/g, columns.join(', '));
};

const parseConstraint = (constraint: string, modelName: string) => {
  const parsed = constraint.replace(/(collection_log_)|(_check)/g, '')
    .replace(modelName.toLowerCase(), '')
    .replace(/_/g, '');
  return parsed;
};
