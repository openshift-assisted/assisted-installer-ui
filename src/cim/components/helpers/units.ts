import defaults from 'lodash/defaults';
import findIndex from 'lodash/findIndex';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import toNumber from 'lodash/toNumber';

type TypeTS = {
  units: string[];
  space: boolean;
  divisor: number;
};
const TYPES: {
  [key: string]: TypeTS;
} = {
  numeric: {
    units: ['', 'k', 'm', 'b'],
    space: false,
    divisor: 1000,
  },
  decimalBytes: {
    units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'],
    space: true,
    divisor: 1000,
  },
  decimalBytesWithoutB: {
    units: ['', 'k', 'M', 'G', 'T', 'P', 'E'],
    space: true,
    divisor: 1000,
  },
  binaryBytes: {
    units: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
    space: true,
    divisor: 1024,
  },
  binaryBytesWithoutB: {
    units: ['i', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'],
    space: true,
    divisor: 1024,
  },
  SI: {
    units: ['', 'k', 'M', 'G', 'T', 'P', 'E'],
    space: false,
    divisor: 1000,
  },
  decimalBytesPerSec: {
    units: ['Bps', 'KBps', 'MBps', 'GBps', 'TBps', 'PBps', 'EBps'],
    space: true,
    divisor: 1000,
  },
  packetsPerSec: {
    units: ['pps', 'kpps'],
    space: true,
    divisor: 1000,
  },
  seconds: {
    units: ['ns', 'μs', 'ms', 's'],
    space: true,
    divisor: 1000,
  },
};

export const getType = (name: string): TypeTS => {
  const type = TYPES[name];
  if (!isPlainObject(type)) {
    return {
      units: [],
      space: false,
      divisor: 1000,
    };
  }
  return type;
};

const convertBaseValueToUnits = (
  value: number,
  unitArray: TypeTS['units'],
  divisor: TypeTS['divisor'],
  initialUnit?: string,
  preferredUnit?: string,
) => {
  const sliceIndex = initialUnit ? unitArray.indexOf(initialUnit) : 0;
  const units_ = unitArray.slice(sliceIndex);

  if (preferredUnit || preferredUnit === '') {
    const unitIndex = units_.indexOf(preferredUnit);
    if (unitIndex !== -1) {
      return {
        value: value / divisor ** unitIndex,
        unit: preferredUnit,
      };
    }
  }

  let unit = units_.shift();
  while (value >= divisor && units_.length > 0) {
    value = value / divisor;
    unit = units_.shift();
  }
  return { value, unit };
};

const convertValueWithUnitsToBaseValue = (
  value: string,
  unitArray: TypeTS['units'],
  divisor: TypeTS['divisor'],
): { value: number; unit?: string } => {
  const defaultReturn = { value: 0, unit: undefined };
  if (typeof value !== 'string') {
    return defaultReturn;
  }

  let units_ = unitArray.slice().reverse();

  // find which unit we're given
  let truncateStringAt = -1;
  const startingUnitIndex = findIndex(units_, function (currentUnitValue) {
    const index = value.indexOf(currentUnitValue);
    if (index > -1) {
      truncateStringAt = index;
      return true;
    }
    return false;
  });
  if (startingUnitIndex <= 0) {
    // can't parse
    return defaultReturn;
  }

  // get the numeric value & prepare unit array for conversion
  units_ = units_.slice(startingUnitIndex);
  value = value.substring(0, truncateStringAt);

  let numValue: number = toNumber(value);

  let unit = units_.shift();
  while (units_.length > 0) {
    numValue = numValue * divisor;
    unit = units_.shift();
  }

  return { value: numValue, unit };
};

const getDefaultFractionDigits = (value: number) => {
  if (value < 1) {
    return 3;
  }
  if (value < 100) {
    return 2;
  }
  return 1;
};

type OptionsType = { locales: string[]; maximumFractionDigits?: number };

const formatValue = (value: number, options?: OptionsType) => {
  const fractionDigits = getDefaultFractionDigits(value);
  const { locales, ...rest } = defaults(options, {
    maximumFractionDigits: fractionDigits,
  });

  // 2nd check converts -0 to 0.
  if (!isFinite(value) || value === 0) {
    value = 0;
  }
  return Intl.NumberFormat(locales, rest).format(value);
};

const round = (value: number, fractionDigits = 10) => {
  if (!isFinite(value)) {
    return 0;
  }
  const multiplier = Math.pow(10, fractionDigits || getDefaultFractionDigits(value));
  return Math.round(value * multiplier) / multiplier;
};

const humanize = (
  value: number,
  typeName: string,
  useRound = false,
  initialUnit: string,
  preferredUnit: string,
) => {
  const type = getType(typeName);

  if (!isFinite(value)) {
    value = 0;
  }

  let converted = convertBaseValueToUnits(
    value,
    type.units,
    type.divisor,
    initialUnit,
    preferredUnit,
  );

  if (useRound) {
    converted.value = round(converted.value);
    converted = convertBaseValueToUnits(
      converted.value,
      type.units,
      type.divisor,
      converted.unit,
      preferredUnit,
    );
  }

  const formattedValue = formatValue(converted.value);

  return {
    string: `${formattedValue}${type.space ? ' ' : ''}${converted.unit || ''}`,
    unit: converted.unit,
    value: converted.value,
  };
};

const dehumanize = (value: string, typeName: string) => {
  const type = getType(typeName);
  return convertValueWithUnitsToBaseValue(value, type.units, type.divisor);
};

const formatPercentage = (value: number, options?: OptionsType) => {
  const { locales, ...rest } = defaults(
    { style: 'percent' }, // Don't allow perent style to be overridden.
    options,
    {
      maximumFractionDigits: 1,
    },
  );
  return Intl.NumberFormat(locales, rest).format(value);
};

type HumanizeFunctionType = (
  v: number,
  initialUnit: string,
  preferredUnit: string,
) => {
  string: string;
  unit?: string;
  value: number;
};

export const humanizeBinaryBytesWithoutB: HumanizeFunctionType = (v, initialUnit, preferredUnit) =>
  humanize(v, 'binaryBytesWithoutB', true, initialUnit, preferredUnit);
export const humanizeBinaryBytes: HumanizeFunctionType = (v, initialUnit, preferredUnit) =>
  humanize(v, 'binaryBytes', true, initialUnit, preferredUnit);
export const humanizeDecimalBytes: HumanizeFunctionType = (v, initialUnit, preferredUnit) =>
  humanize(v, 'decimalBytes', true, initialUnit, preferredUnit);
export const humanizeDecimalBytesPerSec: HumanizeFunctionType = (v, initialUnit, preferredUnit) =>
  humanize(v, 'decimalBytesPerSec', true, initialUnit, preferredUnit);
export const humanizePacketsPerSec: HumanizeFunctionType = (v, initialUnit, preferredUnit) =>
  humanize(v, 'packetsPerSec', true, initialUnit, preferredUnit);
export const humanizeNumber: HumanizeFunctionType = (v, initialUnit, preferredUnit) =>
  humanize(v, 'numeric', true, initialUnit, preferredUnit);
export const humanizeNumberSI: HumanizeFunctionType = (v, initialUnit, preferredUnit) =>
  humanize(v, 'SI', true, initialUnit, preferredUnit);
export const humanizeSeconds: HumanizeFunctionType = (v, initialUnit, preferredUnit) =>
  humanize(v, 'seconds', true, initialUnit, preferredUnit);
export const humanizeCpuCores: HumanizeFunctionType = (v) => {
  const value = v < 1 ? round(v * 1000) : v;
  const unit = v < 1 ? 'm' : '';
  return {
    string: `${formatValue(value)}${unit}`,
    unit,
    value,
  };
};
export const humanizePercentage = (value: number) => {
  // 2nd check converts -0 to 0.
  if (!isFinite(value) || value === 0) {
    value = 0;
  }
  return {
    string: formatPercentage(value / 100),
    unit: '%',
    value: round(value, 1),
  };
};

const baseUnitedValidation = (value: string) => {
  if (value === null || value.length === 0) {
    return;
  }
  if (value.search(/\s/g) !== -1) {
    return 'white space is not allowed';
  }
};

const validateNumber = (float: number) => {
  if (float < 0) {
    return 'must be positive';
  }
  if (!isFinite(float)) {
    return 'must be a number';
  }
};

const validCPUUnits = new Set(['m', '']);
const validateCPUUnit = (value = '') => {
  if (validCPUUnits.has(value)) {
    return;
  }
  return `unrecongnized unit: ${value}`;
};

const validMemUnits = new Set(['E', 'P', 'T', 'G', 'M', 'k', 'Pi', 'Ti', 'Gi', 'Mi', 'Ki']);
const validateMemUnit = (value = '') => {
  if (validMemUnits.has(value)) {
    return;
  }
  return `unrecongnized unit: ${value}`;
};

const validTimeUnits = new Set(['s', 'm', 'h', 'd', 'M', 'y']);
const validateTimeUnit = (value = '') => {
  if (validTimeUnits.has(value)) {
    return;
  }
  return `unrecongnized unit: ${value}`;
};

export const units = {
  round,
  humanize,
  dehumanize,
};

export const validate = {
  split: (value: string) => {
    const index = value.search(/([a-zA-Z]+)/g);
    let number, unit;
    if (index === -1) {
      number = value;
    } else {
      number = value.slice(0, index);
      unit = value.slice(index);
    }
    return [parseFloat(number), unit];
  },

  CPU: (value = '') => {
    if (!value) {
      return;
    }
    const error = baseUnitedValidation(value);
    if (error) {
      return error;
    }

    const [num, unit] = validate.split(value);
    const number: number = parseFloat((num || '') as unknown as string);

    if (!unit) {
      return validateNumber(number);
    }

    return validateNumber(number) || validateCPUUnit(unit as unknown as string);
  },

  time: (value = '') => {
    if (!value) {
      return;
    }
    const error = baseUnitedValidation(value);
    if (error) {
      return error;
    }

    const [num, unit] = validate.split(value);
    const number: number = parseFloat((num || '') as unknown as string);

    if (!unit) {
      return 'number and unit required';
    }

    return validateNumber(number) || validateTimeUnit(unit as unknown as string);
  },

  memory: (value = '') => {
    if (!value) {
      return;
    }
    const error = baseUnitedValidation(value);
    if (error) {
      return error;
    }

    const [num, unit] = validate.split(value);
    const number: number = parseFloat((num || '') as unknown as string);

    if (!unit) {
      return validateNumber(parseFloat(value));
    }

    return validateNumber(number) || validateMemUnit(unit as unknown as string);
  },
};

// Convert k8s compute resources values to a base value for comparison.
// If the value has no unit, it just returns the number, so this function
// can be used for any quota resource (resource counts). `units.dehumanize`
// is problematic for comparing quota resources because you need to know
// what unit you're dealing with already (e.g. decimal vs binary). Returns
// null if value isn't recognized as valid.
export const convertToBaseValue = (value: string) => {
  if (!isString(value)) {
    return null;
  }

  const [num, unit] = validate.split(value);
  const number: number = parseFloat((num || '') as unknown as string);

  const validationError = validateNumber(number);
  if (validationError) {
    return null;
  }

  if (!unit) {
    return number;
  }

  // Handle CPU millicores specifically.
  if (unit === 'm') {
    return number / 1000;
  }

  if (TYPES.binaryBytesWithoutB.units.includes(unit as string)) {
    return dehumanize(value, 'binaryBytesWithoutB').value;
  }

  if (TYPES.decimalBytesWithoutB.units.includes(unit as string)) {
    return dehumanize(value, 'decimalBytesWithoutB').value;
  }

  // Unrecognized unit.
  return null;
};

export const secondsToNanoSeconds = (value: string | number) => {
  const val = Number(value);
  return Number.isFinite(val) ? val * 1000 ** 3 : 0;
};

export const formatToFractionalDigits = (value: number, digits: number) =>
  Intl.NumberFormat(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const formatBytesAsMiB = (bytes: number) => {
  const mib = bytes / 1024 / 1024;
  return formatToFractionalDigits(mib, 1);
};

export const formatBytesAsGiB = (bytes: number) => {
  const gib = bytes / 1024 / 1024 / 1024;
  return formatToFractionalDigits(gib, 2);
};

export const formatCores = (cores: number) => formatToFractionalDigits(cores, 3);
