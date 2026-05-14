import { type LengthUnit, type WeightUnit } from "../services/baby";

const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 0.3937007874;

export function toDisplayWeight(valueKg: number, unit: WeightUnit) {
  return unit === "lb" ? valueKg * KG_TO_LB : valueKg;
}

export function toStoredWeight(value: number, unit: WeightUnit) {
  return unit === "lb" ? value / KG_TO_LB : value;
}

export function toDisplayLength(valueCm: number, unit: LengthUnit) {
  return unit === "in" ? valueCm * CM_TO_IN : valueCm;
}

export function toStoredLength(value: number, unit: LengthUnit) {
  return unit === "in" ? value / CM_TO_IN : value;
}

export function formatUnitValue(value: number, decimals = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(decimals);
}
