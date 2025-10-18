import type { ConditionEvaluator, Filter, FilterEvaluator, BooleanOperatorEvaluator, OperatorName } from "../types/Filter";

export const and: BooleanOperatorEvaluator = (c1, c2) => {
    return c1 && c2;
}

export const or: BooleanOperatorEvaluator = (c1, c2) => {
    return c1 || c2;
}

export const xor: BooleanOperatorEvaluator = (c1, c2) => {
    return c1 !== c2;
}

export const not = (c: boolean) => {
    return !c;
}

export const checkProperty: ConditionEvaluator<any> = (obj, property, value) => {
    let i = 0;
    while (obj && typeof obj === 'object') {
        obj = obj[property[i]];
        i++;
    }

    switch (value.type) {
        case 'exact':
            return obj === value.value;
        case 'range':
            if (typeof obj !== 'number') throw new Error(`Cannot check if non-numerical property is within a range!`);
            let valid = true;
            if (value.min && obj < value.min) valid = false;
            if (value.max && obj > value.max) valid = false;
            return valid;
        case 'notNull':
            return obj != null;
    }
}

export const evalOperator = (name: OperatorName, c1: boolean, c2: boolean) => {
    switch (name) {
        case 'and':
            return and(c1, c2);
        case 'or':
            return or(c1, c2);
        case 'xor':
            return xor(c1, c2);
    }
}

const _evalFilterInternal: FilterEvaluator<any> = (filter: Filter<any>, obj: any) => {
    if (filter.type === 'condition') {
        return checkProperty(obj, filter.property, filter.value);   
    } else {
        const c1 = evalFilter(filter.c1, obj);
        const c2 = evalFilter(filter.c2, obj);
        return evalOperator(filter.name, c1, c2);
    }
}

export const evalFilter: FilterEvaluator<any> = (filter: Filter<any>, obj: any) => {
    if (filter.inverted) {
        return not(_evalFilterInternal(filter, obj));
    } else {
        return _evalFilterInternal(filter, obj);
    }
}