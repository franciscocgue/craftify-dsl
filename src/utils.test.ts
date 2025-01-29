import { myParser, getValue } from "./utils";

const testCases = [
    'userName',
    'userName ',
    ' userName ',
    'userName  ',
    '  userName  ',
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

const testResults = [
    'VAR_userName',
    'VAR_userName',
    'VAR_userName',
    'VAR_userName',
    'VAR_userName',
    'Hey, VAR_username',
    'Hello, JAMES',
    'Hello,(1)---(2)SMIDT17',
    'This is not my dog',
    'THIS and THAAAT',

    30,
    20,
    5,
    15,
    3.1,
    3.14159,
    314000,

    'Yes',
    false,
    false,
    'Yes',
    false,
    true,
]


describe('DSL parser', () => {

    test('parse expression', () => {
        expect(myParser('CONCAT(", ", "Hello", someVariable)')).toEqual({
            type: 'function',
            value: 'CONCAT',
            inputs: [
                {
                    type: "basicValue",
                    value: ", ",
                },
                {
                    type: "basicValue",
                    value: "Hello",
                },
                {
                    type: "variable",
                    value: "someVariable",
                },
            ]
        })
    });
})


describe('DSL from expression to value', () => {

    for (let ii in testCases) {

        const testCase = testCases[ii];
        const testResult = testResults[ii];

        test(testCase, () => {
            const parsedObj = myParser(testCase);
            expect(getValue(parsedObj, [])).toBe(testResult);
        })

    }


})