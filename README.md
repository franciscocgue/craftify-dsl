# Domain-Specific Language

This repository includes the basic definition (or rather, PoC) of the DSL (domain-specific language) that will be used in Craftify.

## Craftify

_Craftify_ is a web application builder whose development is documented in the form of short LinkedIn posts.

The [first post](https://www.linkedin.com/posts/francisco-carmona-guerrero-504773118_webdevelopment-lowcode-sideproject-activity-7216477079922503680-LHGh?utm_source=share&utm_medium=member_desktop) includes the motivation and why the project was started. Additional posts include previews of the application builder, how it works, how it manages logic, the backend, database, UI/UX, etc.


## DSL Overview

This DSL allows the user to define _expressions_ in Craftify. Expressions are single-return functions, such as:

- text operations
  - concatenation of strings
  - conversion to upper / lowercase
  - replace operations
  - text trimming
- math operations
  - sum, multiple, divide
  - average
  - round
- logic operations
  - if-then-else
  - negating values
  - and / or
  - greater than / lower than

Process consists of 3 steps:

1. Get user input
2. Parse user input and obtain the AST (Abstract Sytax Tree)
3. Execute and get the expression's value

### Examples

The following list of examples have the following format: `'input given by the user' --> result`

```javascript
    [
        'CONCAT(" ", "Hello", "World") --> Hello World',
        'UPPER("Hello") --> HELLO',
        'LOWER("HeLLo") --> hello',
        'SUBSTITUTE("Some old text", "old", "new") --> Some new text',
        'LEN("Hello") --> 5',
        'TRIM(" HeLLo   ") --> hello',
        'RIGHT("Hello", 2) --> lo',
        'LEFT("Hello", 2) --> lo',
        'SUM(5, -2) --> 3',
        'MULTIPLY(5, 2) --> 10',
        'DIVIDE(5, 2) --> 2.5',
        'AVERAGE(5, 2, 5) --> 4',
        'ROUND(3.14, 1) --> 3.1',
        'IF(HIGHER(5,2), "5 higher then 2", "5 not higher than 2") --> 5 higher than 2',
        'NOT(true) --> false',
        'HIGHER(5, 1) --> true',
        'LOWER(5, 1) --> false',
        'EQUAL(5, 1) --> false',
        'AND(true , false) --> false',
        'OR(true , false) --> true',
    ],
```

Nested cases are also allowed:

`SUBSTITUTE(CONCAT(" ", "This", "is", "not", "your", "dog"), "your", LOWER(TRIM("  MY  ")))`

### Specifications

Only a single root expression is accepted. Its arguments can be

- other, nested expressions
- string surrounded by double quotes (example: "hey")
- expressions (similar to strings but no double quotes)
- numbers
- booleans (true / false)

### Future work

- add a validator that checks expression is correct
  - required number of inputs according to function
  - inputs have correct data types
  - no parenthesis group left open
- add support for variables
- better error handling