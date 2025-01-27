import { FUNCTION_CONFIG } from "./config";

export type ParsedExpression = ParsedFunctionType & {
    inputs: (ParsedValueType | ParsedFunctionType)[];
}

export type ParsedFunctionType = {
    type: "function",
    value: keyof typeof FUNCTION_CONFIG,
    inputs: (ParsedFunctionType | ParsedValueType)[]
}

export type ParsedValueType = {
    type: "basicValue" | "variable",
    value: string | number | boolean,
}