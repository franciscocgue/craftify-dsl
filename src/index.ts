import { myParser, getValueRecursively } from "./utils";

const testCases = [
    'IF(isLoggedIn, CONCAT(" ", "Hey,", username), "Please, log in")',
    'CONCAT(", ", "Hello", UPPER("James"))',
    'CONCAT("","Hello,",CONCAT("---","(1)","(2)"),UPPER("Smidt"),LEN("ihave17characters"))',
    'SUBSTITUTE(CONCAT(" ", "This", "is", "not", "your", "dog"), "your", LOWER(TRIM("  MY  ")))',
    'CONCAT(" ", RIGHT("BLABLAbla THIS", 4), "and", LEFT("THAAATblabla", 6))',

    'SUM ( 15 , SUM ( 10 , LEN ( "value")) )',
    'MULTIPLY(LEN("aa"), 10)',
    'DIVIDE(10, LEN("aa"))',
    'AVERAGE(10, 20, 15)',
    'ROUND(3.14159, 1)',
    'ROUND(3.14159, 10)',
    'ROUND(314159, -3)',

    'IF(IS_HIGHER(LEN("test"), 2) , "Yes", false)',
    'IF(IS_LOWER(LEN("test"), 2) , "Yes", false)',
    'IF(IS_EQUAL("2", 2) , "Yes", false)',
    'IF(IS_EQUAL(2, 2) , "Yes", false)',
    'AND(NOT(true), true)',
    'OR(NOT(true), true)',
];

for (let testCase of testCases) {
    const parsedObj = myParser(testCase);
    const result = getValueRecursively(parsedObj, [])
    console.log({
        test: testCase,
        result: result,
    })

}