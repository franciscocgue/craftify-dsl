import pkg from "lodash";
const { cloneDeep } = pkg;
import { FUNCTION_CONFIG } from "./config";
import { ParsedExpression, ParsedFunctionType, ParsedValueType } from "./types";


function* makeIterator(iterable: any) {
    for (const item of iterable) {
        yield item;
    }
}

export const myParser = (expression: string): ParsedFunctionType => {

    const iterator = makeIterator(expression);

    const _helper = (parsingString: boolean, acc: string): (ParsedValueType | ParsedFunctionType)[] => {

        const inputs: (ParsedValueType | ParsedFunctionType)[] = [];
        let next = iterator.next();

        while (!next.done) {

            if (next.value === '"') {
                if (parsingString) {
                    // end of string
                    inputs.push({
                        type: 'basicValue' as const,
                        value: acc,
                    });
                    parsingString = false;
                    acc = '';
                } else {
                    // start of string
                    parsingString = true;
                    acc = '';
                }
            } else if (!parsingString) {
                // function inputs start
                if (Object.keys(FUNCTION_CONFIG).includes(acc) && (next.value === '(' || next.value === ' ')) {
                    inputs.push({
                        type: 'function' as const,
                        value: acc as ParsedFunctionType['value'],
                        inputs: [..._helper(false, '')]
                    });
                    acc = '';
                } else if (next.value === ' ' || next.value === ',' || next.value === ')') {
                    // boolean / number / variable finished
                    if (acc.toLocaleLowerCase() === 'true' || acc.toLocaleLowerCase() === 'false') {
                        inputs.push({
                            type: 'basicValue' as const,
                            value: acc.toLocaleLowerCase() === 'true',
                        });
                    } else if (!isNaN(parseFloat(acc.trim()))) {
                        // add number
                        inputs.push({
                            type: 'basicValue' as const,
                            value: parseFloat(acc.trim()),
                        });
                    } else if (acc.trim() !== '' && acc.trim() !== '(') {
                        // add variable
                        inputs.push({
                            type: 'variable' as const,
                            value: acc,
                        });
                    }
                    acc = '';
                    if (next.value === ')') {
                        // end of function
                        return inputs;
                    }
                } else {
                    acc += next.value;
                }
            } else {
                acc += next.value;
            }


            next = iterator.next();

        }

        return inputs;
    };

    return _helper(false, '')[0] as ParsedFunctionType;
};




// @TODO: function to validate parsed object, in terms of number of inputs (in the future also types)
// Use before finding value;
// USE CASE: let user know if input is valid in real time

export const getValueRecursively = (parsedObj: ParsedExpression, currPath: number[]): any => {

    // get current node
    let currNode: ParsedExpression | ParsedFunctionType | ParsedValueType = cloneDeep(parsedObj);
    // update current node (if nested)
    for (let ii of currPath) {
        if ('inputs' in currNode) {
            currNode = currNode.inputs[ii]
        };
    };

    // if string, return
    if (currNode.type === 'basicValue') {
        return currNode.value;
    };

    // if variable, return
    if (currNode.type === 'variable') {
        // @TODO: get expression's value from external store
        return `VAR_${currNode.value}`;
    };

    // else: function
    const functionName = currNode.value;
    let functionInputs: (ParsedValueType | ParsedFunctionType)[] = [];
    if ('inputs' in currNode) {
        functionInputs = currNode.inputs;
    };
    switch (functionName) {
        case 'CONCAT':
            // for each input run this recursive function
            // first argument is separator
            const numberOfStandardParams = 1; // separator
            return functionInputs.slice(numberOfStandardParams).map((input, idx: number) => {
                return getValueRecursively(parsedObj, [...currPath, idx + numberOfStandardParams]);
            }).join(functionInputs[0].value as string);
        case 'UPPER':
            if (functionInputs.length > 1) {
                throw new Error(`Function "${functionName}" accepts only one argument`)
            }
            return String(getValueRecursively(parsedObj, [...currPath, 0])).toUpperCase();
        case 'LOWER':
            if (functionInputs.length > 1) {
                throw new Error(`Function "${functionName}" accepts only one argument`)
            }
            return String(getValueRecursively(parsedObj, [...currPath, 0])).toLowerCase();
        case 'SUBSTITUTE':
            return String(getValueRecursively(parsedObj, [...currPath, 0])).replace(
                String(getValueRecursively(parsedObj, [...currPath, 1])),
                String(getValueRecursively(parsedObj, [...currPath, 2]))
            );
        case 'LEN':
            if (functionInputs.length > 1) {
                throw new Error(`Function "${functionName}" accepts only one argument`)
            }
            return String(getValueRecursively(parsedObj, [...currPath, 0])).length;
        case 'TRIM':
            return String(getValueRecursively(parsedObj, [...currPath, 0])).trim();
        case 'RIGHT':
            return String(getValueRecursively(parsedObj, [...currPath, 0])).slice(
                -1 * parseInt(getValueRecursively(parsedObj, [...currPath, 1]))
            );
        case 'LEFT':
            return String(getValueRecursively(parsedObj, [...currPath, 0])).slice(
                0,
                parseInt(getValueRecursively(parsedObj, [...currPath, 1]))
            );
        case 'SUM':
            return functionInputs.reduce((acc, curr, idx: number) => {
                return acc + getValueRecursively(parsedObj, [...currPath, idx]);
            }, 0);
        case 'MULTIPLY':
            return functionInputs.slice(1).reduce((acc, curr, idx: number) => {
                return acc * getValueRecursively(parsedObj, [...currPath, idx + 1]);
            }, getValueRecursively(parsedObj, [...currPath, 0]));
        case 'DIVIDE':
            return functionInputs.slice(1).reduce((acc, curr, idx: number) => {
                return acc / getValueRecursively(parsedObj, [...currPath, idx + 1]);
            }, getValueRecursively(parsedObj, [...currPath, 0]));
        case 'AVERAGE':
            return functionInputs.reduce((acc, curr, idx: number) => {
                return acc + getValueRecursively(parsedObj, [...currPath, idx]);
            }, 0) / functionInputs.length;
        case 'ROUND':
            const val = getValueRecursively(parsedObj, [...currPath, 0]);
            const roundDigits = getValueRecursively(parsedObj, [...currPath, 1]);
            const factor = Math.pow(10, roundDigits);
            return Math.round(val * factor) / factor;
        case 'IF':
            const condition = getValueRecursively(parsedObj, [...currPath, 0]);
            if (condition) {
                return getValueRecursively(parsedObj, [...currPath, 1]);
            } else {
                return getValueRecursively(parsedObj, [...currPath, 2])
            };
        case 'NOT':
            return !getValueRecursively(parsedObj, [...currPath, 0]);
        case 'IS_HIGHER':
            return getValueRecursively(parsedObj, [...currPath, 0]) >
                getValueRecursively(parsedObj, [...currPath, 1]);
        case 'IS_LOWER':
            return getValueRecursively(parsedObj, [...currPath, 0]) <
                getValueRecursively(parsedObj, [...currPath, 1]);
        case 'IS_EQUAL':
            return getValueRecursively(parsedObj, [...currPath, 0]) ===
                getValueRecursively(parsedObj, [...currPath, 1]);
        case 'AND':
            return functionInputs.reduce((acc, curr, idx: number) => {
                return acc && getValueRecursively(parsedObj, [...currPath, idx]);
            }, true);
        case 'OR':
            return functionInputs.reduce((acc, curr, idx: number) => {
                return acc || getValueRecursively(parsedObj, [...currPath, idx]);
            }, false);
        default:
            throw new Error(`Function "${functionName}" does not exists`)
    }

};