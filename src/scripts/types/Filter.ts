export type Filter<T> = Condition<T> | BooleanOperator<T>;

export interface BooleanOperator<T> {
    type: 'operator';
    c1: Condition<T> | BooleanOperator<T>;
    c2: Condition<T> | BooleanOperator<T>;
    name: OperatorName;
    inverted: boolean;
}

export interface Condition<T> {
    type: 'condition';
    property: any[];
    value: ConditionValueExact<T> | ConditionValueRange | ConditionValueNotNull;
    inverted: boolean;
}

export interface ConditionValueExact<T> {
    type: 'exact';
    value: T[keyof T];
}

export interface ConditionValueRange {
    type: 'range';
    min?: number;
    max?: number;
}

export interface ConditionValueNotNull {
    type: 'notNull';
}

export type FilterEvaluator<T> = (filter: Filter<T>, obj: T) => boolean;

export type ConditionEvaluator<T> = (obj: T, property: any[], value: ConditionValueExact<T> | ConditionValueRange | ConditionValueNotNull) => boolean;

export type BooleanOperatorEvaluator = (c1: boolean, c2: boolean) => boolean;

export const OperatorNames = ['and', 'or', 'xor'] as const;

export type OperatorName = typeof OperatorNames[number];