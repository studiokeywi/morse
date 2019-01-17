/** Format the arguments passed to an function into a semi-pretty string
 * @param {Array} args - The arguments object from the original function
 * @return {string} The semi-pretty string version of the arguments*/
function formatArgs(args) {
    function id(a) {
        return typeof a !== 'object' ? typeof a : a.constructor.name;
    }
    // TODO make this prettier/better
    // TODO JSDocs
    function gen2Str(a) {
        if (typeof a === 'object') {
            if (!Array.isArray(a)) {
                a = Object.keys(a)
                    .filter(k => a.hasOwnProperty(k))
                    .map(
                        k =>
                            `${k}: ${
                                Array.isArray(a[k])
                                    ? `[ ${a[k].join(', ')} ]`
                                    : a[k]
                            }`
                    )
                    .join('; ');
            } else {
                a = a.join(', ');
            }
        }
        if (typeof a === 'function') {
            a = a.name;
        }
        return a;
    }
    return typeof args === 'object'
        ? Array.from(args)
              .map(
                  a =>
                      typeof a == 'object'
                          ? `Object: { ${gen2Str(a)} }`
                          : `${id(a)}: ${gen2Str(a)}`
              )
              .join(', ') + '\n'
        : gen2Str(args);
}

/** A prototype logging device */
logger =
    window.logger ||
    Object.freeze(
        (() => {
            const cons = {
                clear: console.clear,
                debug: console.debug,
                error: console.error,
                group: console.group,
                groupEnd: console.groupEnd,
                info: console.info,
                log: console.log,
                warn: console.warn
            };
            const outText = document.getElementById('output');
            let indent = 0;
            // TODO JSDocs
            function wrap(msg, style) {
                const child = document.createElement('div');
                if (style === 'groupEnd') {
                    return indent--;
                } else if (style === 'group') {
                    indent++;
                }
                child.className = style;
                const ind = Array(4 * indent)
                    .fill(' ')
                    .join('');
                child.innerHTML += `${ind}${
                    style === 'group' ? '<b>' : ''
                }${msg.replace(/\n/, '<br>' + ind)}${
                    style === 'group' ? '</b>' : ''
                }<br>`;
                outText.append(child);
                child.scrollIntoView({
                    block: 'end',
                    inline: 'nearest'
                });
            }
            const html = {
                clear: () => (outText.innerHTML = ''),
                debug: msg => wrap(msg, 'debug'),
                error: msg => wrap(msg, 'error'),
                group: msg => wrap(msg, 'group'),
                groupEnd: msg => wrap(msg, 'groupEnd'),
                info: msg => wrap(msg, 'info'),
                log: msg => wrap(msg, 'log'),
                warn: msg => wrap(msg, 'warn')
            };
            const expo = {
                console: cons,
                webpage: html
            };
            return Object.freeze(expo);
        })()
    );
// TODO: Make this less confusing (potential shadowing dangers)
//LOGGER = window.LOGGER || logger.console;
LOGGER = window.LOGGER || logger.webpage;

/** Morse code object. Provides conversion from letters to and from morse code in two formats, morse-words or morse-bits.<br>
Each morse representation is packed as an array:
<ul>
    <li>morse-words: ['DIT', 'DAH']</li>
    <li>morse-bits: [1, 0, 1, 1, 1, 0]</li>
</ul>
Also provided is the testing suite used in development.<br>
Future plans include updated character set and full string translations.*/
morse =
    window.morse ||
    Object.freeze(
        (() => {
            /** Morse code data */
            const MORSE = {
                SYMBOLS: {
                    DIT: [1, 0],
                    DAH: [1, 1, 1, 0],
                    SMALL_GAP: [0, 0],
                    LARGE_GAP: [0, 0, 0, 0, 0, 0]
                },
                MAP: {
                    a: ['DIT', 'DAH'],
                    b: ['DAH', 'DIT', 'DIT', 'DIT'],
                    c: ['DAH', 'DIT', 'DAH', 'DIT'],
                    d: ['DAH', 'DIT', 'DIT'],
                    e: ['DIT'],
                    f: ['DIT', 'DIT', 'DAH', 'DIT'],
                    g: ['DAH', 'DAH', 'DIT'],
                    h: ['DIT', 'DIT', 'DIT', 'DIT'],
                    i: ['DIT', 'DIT'],
                    j: ['DIT', 'DAH', 'DAH', 'DAH'],
                    k: ['DAH', 'DIT', 'DAH'],
                    l: ['DIT', 'DAH', 'DIT', 'DIT'],
                    m: ['DAH', 'DAH'],
                    n: ['DAH', 'DIT'],
                    o: ['DAH', 'DAH', 'DAH'],
                    p: ['DIT', 'DAH', 'DAH', 'DIT'],
                    q: ['DAH', 'DAH', 'DIT', 'DAH'],
                    r: ['DIT', 'DAH', 'DIT'],
                    s: ['DIT', 'DIT', 'DIT'],
                    t: ['DAH'],
                    u: ['DIT', 'DIT', 'DAH'],
                    v: ['DIT', 'DIT', 'DIT', 'DAH'],
                    w: ['DIT', 'DAH', 'DAH'],
                    x: ['DAH', 'DIT', 'DIT', 'DAH'],
                    y: ['DAH', 'DIT', 'DAH', 'DAH'],
                    z: ['DAH', 'DAH', 'DIT', 'DIT'],
                    '<>': ['SMALL_GAP'],
                    ' ': ['LARGE_GAP']
                }
            };
            /** Convert a letter into an array of morse-words
             * @param {Array} conv - The letter to convert
             * @return {string} An array of morse-words */
            function convLetterMorse(conv) {
                if (MORSE.MAP[conv] === void 0) {
                    throw new Error(
                        `The provided character or symbol is not mapped in this library:\n\t${formatArgs(
                            arguments
                        )}`
                    );
                }
                return MORSE.MAP[conv];
            }
            /** Convert an array of morse-words into a letter
             * @param {Array} conv - The morse-words array to convert
             * @return {string} The converted letter */
            function convMorseLetter(conv) {
                let match;
                for (let key of Object.keys(MORSE.MAP)) {
                    if (isMatch(MORSE.MAP[key], conv)) {
                        match = key;
                        break;
                    }
                }
                return match;
            }
            /** Convert a letter into an array of morse-bits
             * @param {Array} conv - The letter to convert
             * @return {string} An array of morse-bits */
            function convLetterDigital(conv) {
                return convMorseDigital(convLetterMorse(conv));
            }
            /** Convert an array of morse-bits into a letter
             * @param {Array} conv - The morse-bits array to convert
             * @return {string} The converted letter */
            function convDigitalLetter(conv) {
                let match;
                for (let key of Object.keys(MORSE.MAP)) {
                    if (isMatch(convMorseDigital(MORSE.MAP[key]), conv)) {
                        match = key;
                        break;
                    }
                }
                return match;
            }
            /** Convert an array of morse-words into an array of morse-bits
             * @param {Array} conv - The morse-words array to convert
             * @return {Array} An array of morse-bits */
            function convMorseDigital(conv) {
                if (
                    !Array.isArray(conv) ||
                    conv.filter(s => !/[D[IT|AH]|.+GAP]/.test(s)).length > 0
                ) {
                    throw new Error(
                        `The provided morse code failed structural requirements:\n\t${formatArgs(
                            arguments
                        )}`
                    );
                }
                return conv.map(s => MORSE.SYMBOLS[s]).flat();
            }
            /** Convert an array of morse-its into an array of morse-words
             * @param  {Array} conv - The morse-bits to convert
             * @return {Array} An array of morse-words */
            function convDigitalMorse(conv) {
                return convLetterMorse(convDigitalLetter(conv));
            }
            // TODO: JSDocs
            function translateToMorse(str, mode) {
                if (typeof str !== 'string' || mode === void 0) {
                    throw new Error(
                        `Invalid args:\n\t${formatArgs(arguments)}`
                    );
                }
                if (mode !== 'bits' && mode !== 'words') {
                    throw new Error(
                        `Invalid mode:\n\t${formatArgs(arguments)}`
                    );
                }
                let out = [];
                str.split('').forEach(char => {
                    if (MORSE.MAP.hasOwnProperty(char)) {
                        let push =
                            mode === 'words'
                                ? convLetterMorse
                                : convLetterDigital;
                        out.push(push(char));
                        out.push(
                            mode === 'words'
                                ? 'SMALL_GAP'
                                : MORSE.SYMBOLS.SMALL_GAP
                        );
                    }
                });
                out.pop();
                out.push(
                    mode === 'words' ? 'LARGE_GAP' : MORSE.SYMBOLS.LARGE_GAP
                );
                return out.flat();
            }
            // TODO: JSDocs
            // FIXME Fix this
            function translateFromMorse(morse, mode) {
                if (!Array.isArray(morse) || mode === void 0) {
                    throw new Error(
                        `Invalid args:\n\t${formatArgs(arguments)}`
                    );
                }
                if (mode !== 'bits' && mode !== 'words') {
                    throw new Error(
                        `Invalid mode:\n\t${formatArgs(arguments)}`
                    );
                }
                let dit;
                let dah;
                let smGap;
                let lgGap;
                let push;
                let sliceSize;
                if (mode === 'words') {
                    dit = ['DIT'];
                    dah = ['DAH'];
                    smGap = ['SMALL_GAP'];
                    lgGap = ['LARGE_GAP'];
                    push = convMorseLetter;
                    sliceSize = 1;
                } else {
                    dit = MORSE.SYMBOLS.DIT;
                    dah = MORSE.SYMBOLS.DAH;
                    smGap = MORSE.SYMBOLS.SMALL_GAP;
                    lgGap = MORSE.SYMBOLS.LARGE_GAP;
                    push = convDigitalLetter;
                    sliceSize = 2;
                }
                let out = [];
                let tmp = [];
                let clone = morse.slice(0, morse.length);
                LOGGER.debug('Input:\t' + formatArgs(morse));
                LOGGER.debug('Clone:\t' + formatArgs(clone));
                while (clone.length > 0) {
                    tmp = tmp.concat(clone.splice(0, sliceSize)).flat();
                    LOGGER.group('LOOP');
                    LOGGER.debug('Current tmp:\t' + formatArgs(tmp));
                    LOGGER.debug('Clone:\t' + formatArgs(clone));
                    if (isMatch(clone.slice(0, sliceSize), smGap)) {
                        LOGGER.debug('Found a small gap');
                        // Capture large gaps
                        if (isMatch(clone, lgGap)) {
                            LOGGER.debug('End of the line');
                            tmp = tmp.concat(clone.splice(0, sliceSize)).flat();
                            LOGGER.debug('tmp:\t' + formatArgs(tmp));
                            LOGGER.groupEnd();
                            continue;
                        }
                        out.push(
                            (mode === 'words'
                                ? convMorseLetter
                                : convDigitalLetter)(tmp)
                        );
                        tmp = [];
                        clone.splice(0, sliceSize);
                        LOGGER.debug(formatArgs(clone));
                        LOGGER.groupEnd();
                        continue;
                    }
                    LOGGER.groupEnd();
                }
                return out.flat().join('');
            }
            /** Boolean-return wrapper for checkMatch
             * @param {*} comp - The variable to check; the testing value
             * @param {*} base - The variable to check against; the basis of comparison
             * @return {boolean} Whether the two variables matched */
            function isMatch(comp, base) {
                return checkMatch(comp, base) === 'OK';
            }
            /** Compare two variables for equality, given arbitrary inputs, and gives a message string response
             * @param {*} comp - The variable to check; the testing value
             * @param {*} base - The variable to check against; the basis of comparison
             * @return {string} A message detailing the comparison */
            function checkMatch(comp, base) {
                if (Array.isArray(comp) !== Array.isArray(base)) {
                    return 'An array is being compared to a non-array';
                }
                if (!Array.isArray(comp)) {
                    if (comp != base && comp !== base) {
                        return 'Comparison failed at both != and !== levels';
                    }
                } else {
                    if (comp.length !== base.length) {
                        return 'Check array is different size than base array';
                    }
                    if (comp.filter((a, i) => base[i] !== comp[i]).length > 0) {
                        return 'One or more elements of the check array are incorrect as compared to the base';
                    }
                }
                return 'OK';
            }

            /** Testing suite object */
            const tests = (() => {
                /** Number of tests that ran and failed */
                let failedCount = 0;
                /** Number of tests that ran and succeeded */
                let succeedCount = 0;
                /** Number of tests that ran */
                let runCount = 0;
                /** Tests where success is expected */
                const validTests = [
                    {
                        title: 'Is Dit',
                        modFN: identity,
                        test: [1, 0],
                        base: MORSE.SYMBOLS.DIT
                    },
                    {
                        title: 'Is Dah',
                        modFN: identity,
                        test: [1, 1, 1, 0],
                        base: MORSE.SYMBOLS.DAH
                    },
                    {
                        title: 'Is Small Gap',
                        modFN: identity,
                        test: [0, 0],
                        base: MORSE.SYMBOLS.SMALL_GAP
                    },
                    {
                        title: 'Is Large Gap',
                        modFN: identity,
                        test: [0, 0, 0, 0, 0, 0],
                        base: MORSE.SYMBOLS.LARGE_GAP
                    },
                    {
                        title: 'Morse → Binary',
                        modFN: convMorseDigital,
                        test: ['DIT', 'DAH'],
                        base: [1, 0, 1, 1, 1, 0]
                    },
                    {
                        title: 'Binary → Morse',
                        modFN: convDigitalMorse,
                        test: [1, 0, 1, 1, 1, 0],
                        base: ['DIT', 'DAH']
                    },
                    {
                        title: 'Letter → Morse',
                        modFN: convLetterMorse,
                        test: 'a',
                        base: ['DIT', 'DAH']
                    },
                    {
                        title: 'Morse → Letter',
                        modFN: convMorseLetter,
                        test: ['DIT', 'DAH'],
                        base: 'a'
                    },
                    {
                        title: 'Letter → Binary',
                        modFN: convLetterDigital,
                        test: 'a',
                        base: [1, 0, 1, 1, 1, 0]
                    },
                    {
                        title: 'Binary → Letter',
                        modFN: convDigitalLetter,
                        test: [1, 0, 1, 1, 1, 0],
                        base: 'a'
                    },
                    {
                        title: 'Translate: To Morse-Bits',
                        modFN: function transWordDigital() {
                            return translateToMorse('sos', 'bits');
                        },
                        test: 'sos',
                        base: Array(3)
                            .fill(MORSE.SYMBOLS.DIT)
                            .concat(MORSE.SYMBOLS.SMALL_GAP)
                            .concat(Array(3).fill(MORSE.SYMBOLS.DAH))
                            .concat(MORSE.SYMBOLS.SMALL_GAP)
                            .concat(Array(3).fill(MORSE.SYMBOLS.DIT))
                            .concat(MORSE.SYMBOLS.LARGE_GAP)
                            .flat()
                    },
                    {
                        title: 'Translate: To Morse-Words',
                        modFN: function transWordMorse() {
                            return translateToMorse('sos', 'words');
                        },
                        test: 'sos',
                        base: Array(3)
                            .fill('DIT')
                            .concat('SMALL_GAP')
                            .concat(Array(3).fill('DAH'))
                            .concat('SMALL_GAP')
                            .concat(Array(3).fill('DIT'))
                            .concat('LARGE_GAP')
                            .flat()
                    },
                    {
                        title: 'Translate: From Morse-Bits',
                        modFN: function transDigitalWord() {
                            return translateFromMorse(
                                Array(3)
                                    .fill(MORSE.SYMBOLS.DIT)
                                    .concat(MORSE.SYMBOLS.SMALL_GAP)
                                    .concat(Array(3).fill(MORSE.SYMBOLS.DAH))
                                    .concat(MORSE.SYMBOLS.SMALL_GAP)
                                    .concat(Array(3).fill(MORSE.SYMBOLS.DIT))
                                    .concat(MORSE.SYMBOLS.LARGE_GAP)
                                    .flat(),
                                'bits'
                            );
                        },
                        test: Array(3)
                            .fill(MORSE.SYMBOLS.DIT)
                            .concat(MORSE.SYMBOLS.SMALL_GAP)
                            .concat(Array(3).fill(MORSE.SYMBOLS.DAH))
                            .concat(MORSE.SYMBOLS.SMALL_GAP)
                            .concat(Array(3).fill(MORSE.SYMBOLS.DIT))
                            .concat(MORSE.SYMBOLS.LARGE_GAP)
                            .flat(),
                        base: 'sos'
                    },
                    {
                        title: 'Translate: From Morse-Words',
                        modFN: function transMorseWord() {
                            LOGGER.debug('MORSE WORD INPUT');
                            let arr = Array(3)
                                .fill('DIT')
                                .concat('SMALL_GAP')
                                .concat(Array(3).fill('DAH'))
                                .concat('SMALL_GAP')
                                .concat(Array(3).fill('DIT'))
                                .concat('LARGE_GAP')
                                .flat();
                            LOGGER.debug(formatArgs(arr));
                            let morse = translateFromMorse(
                                Array(3)
                                    .fill('DIT')
                                    .concat('SMALL_GAP')
                                    .concat(Array(3).fill('DAH'))
                                    .concat('SMALL_GAP')
                                    .concat(Array(3).fill('DIT'))
                                    .concat('LARGE_GAP')
                                    .flat(),
                                'words'
                            );
                            LOGGER.debug('MORSE FROM TRANSLATE');
                            LOGGER.debug(formatArgs(morse));
                            return morse;
                        },
                        test: Array(3)
                            .fill('DIT')
                            .concat('SMALL_GAP')
                            .concat(Array(3).fill('DAH'))
                            .concat('SMALL_GAP')
                            .concat(Array(3).fill('DIT'))
                            .concat('LARGE_GAP')
                            .flat(),
                        base: 'sos'
                    }
                ];
                /** Tests where failure is expected */
                const invalidTests = [
                    {
                        title: 'Is Dit',
                        modFN: identity,
                        test: 1,
                        base: MORSE.SYMBOLS.DIT
                    },
                    {
                        title: 'Is Dit',
                        modFN: identity,
                        test: [0, 1, 1],
                        base: MORSE.SYMBOLS.DIT
                    },
                    {
                        title: 'Is Dit',
                        modFN: identity,
                        test: [0, 1],
                        base: MORSE.SYMBOLS.DIT
                    },
                    {
                        title: 'Is Dah',
                        modFN: identity,
                        test: 3,
                        base: MORSE.SYMBOLS.DAH
                    },
                    {
                        title: 'Is Dah',
                        modFN: identity,
                        test: [1, 0],
                        base: MORSE.SYMBOLS.DAH
                    },
                    {
                        title: 'Is Dah',
                        modFN: identity,
                        test: [1, 2, 3],
                        base: MORSE.SYMBOLS.DAH
                    },
                    {
                        title: 'Is Small Gap',
                        modFN: identity,
                        test: [0],
                        base: MORSE.SYMBOLS.SMALL_GAP
                    },
                    {
                        title: 'Is Small Gap',
                        modFN: identity,
                        test: [0, 1],
                        base: MORSE.SYMBOLS.SMALL_GAP
                    },
                    {
                        title: 'Is Large Gap',
                        modFN: identity,
                        test: [0],
                        base: MORSE.SYMBOLS.LARGE_GAP
                    },
                    {
                        title: 'Is Large Gap',
                        modFN: identity,
                        test: [1, 0, 1, 0, 1, 0],
                        base: MORSE.SYMBOLS.LARGE_GAP
                    },
                    {
                        title: 'Morse → Binary',
                        modFN: convMorseDigital,
                        test: ['DIT', 'DAH'],
                        base: [1, 1, 1, 0, 1, 0]
                    },
                    {
                        title: 'Binary → Morse',
                        modFN: convDigitalMorse,
                        test: [1, 1, 1, 0, 1, 0],
                        base: ['DIT', 'DAH']
                    },
                    {
                        title: 'Letter → Morse',
                        modFN: convLetterMorse,
                        test: 'e',
                        base: ['DAH', 'DIT']
                    },
                    {
                        title: 'Morse → Letter',
                        modFN: convMorseLetter,
                        test: ['DAH', 'DIT'],
                        base: 'e'
                    },
                    {
                        title: 'Letter → Binary',
                        modFN: convLetterDigital,
                        test: 'e',
                        base: [1, 1, 1, 0, 1, 0]
                    },
                    {
                        title: 'Binary → Letter',
                        modFN: convDigitalLetter,
                        test: [1, 1, 1, 0, 1, 0],
                        base: 'e'
                    },
                    {
                        title: 'Translate: To Morse-Bits',
                        modFN: function transWordMorse() {
                            return translateToMorse('sos', 'bits');
                        },
                        test: 'sos',
                        base: Array(3)
                            .fill(MORSE.SYMBOLS.DAH)
                            .concat(Array(3).fill(MORSE.SYMBOLS.DIT))
                            .concat(Array(3).fill(MORSE.SYMBOLS.DAH))
                            .flat()
                    },
                    {
                        title: 'Translate: To Morse-Words',
                        modFN: function transWordDigital() {
                            return translateToMorse('sos', 'words');
                        },
                        test: 'sos',
                        base: Array(3)
                            .fill('DAH')
                            .concat(Array(3).fill('DIT'))
                            .concat(Array(3).fill('DAH'))
                            .flat()
                    }
                ];
                /** Report a failed test
                 * @param {string} msg - The failure message to report */
                function testFailed(msg) {
                    failedCount++;
                    LOGGER.warn(msg);
                }
                /** Report a successful test
                 * @param {string} msg - The success message to report */
                function testSucceeded(msg) {
                    succeedCount++;
                    LOGGER.info(msg);
                }
                /** Universal testing method.
                 * @param {string} title - The title of the test
                 * @param {function} modFN - The modification function that creates the output value
                 * @param {object} params.test - The output value to test
                 * @param {object} params.base - The expected output value  */
                function universalTest(title, modFN, params) {
                    LOGGER.group(title);
                    if (modFN.name.includes('transMorse')) {
                        LOGGER.debug('Final Test');
                    }
                    runCount++;
                    try {
                        let msg = checkMatch(modFN(params.test), params.base);
                        (msg !== 'OK' ? testFailed : testSucceeded)(
                            formatArgs(arguments) +
                                (msg !== 'OK'
                                    ? msg
                                    : msg + ' -- ' + modFN(params.test))
                        );
                    } catch (err) {
                        testFailed(
                            formatArgs(arguments) +
                                err.message +
                                '\n' +
                                err.stack
                        );
                        console.error(err.message);
                        console.trace();
                    }
                    LOGGER.groupEnd();
                }
                /** Testing function returns the passed argument
                 * @param {object} arg - The value
                 * @return {object} The same value, unmodified */
                function identity(arg) {
                    return arg;
                }
                /** Sets the counters for tests succeeded, tests failed, and tests ran to zero */
                function resetTestCounts() {
                    failedCount = 0;
                    succeedCount = 0;
                    runCount = 0;
                }
                /** Run the test block where all tests are expected to succeed
                 * @param {boolean} reset - Whether or not to reset the test counts first */
                function runValidTests(reset) {
                    if (!!reset) {
                        resetTestCounts();
                    }
                    LOGGER.group('Valid Tests Block');
                    validTests.forEach(t => {
                        let { title, modFN, test, base } = t;
                        universalTest(title, modFN, { test, base });
                    });
                    LOGGER.groupEnd();
                }
                /** Run the test block where all tests are expected to fail
                 * @param {boolean} reset - Whether or not to reset the test counts first */
                function runInvalidTests(reset) {
                    if (!!reset) {
                        resetTestCounts();
                    }
                    LOGGER.group('Inalid Tests Block');
                    invalidTests.forEach(t => {
                        let { title, modFN, test, base } = t;
                        universalTest(title, modFN, { test, base });
                    });
                    LOGGER.groupEnd();
                }
                /** Run both valid and invalid test blocks
                 * @param {boolean} reset - Whether or not to reset the test counts first */
                function runAllTests(reset) {
                    let t = validTests[validTests.length - 2];
                    LOGGER.debug(t.title);
                    LOGGER.debug(t.modFN());
                    if (!!reset) {
                        resetTestCounts();
                        reset = false;
                    }
                    resetTestCounts();
                    LOGGER.group('ALL TESTS');
                    runValidTests(reset);
                    runInvalidTests(reset);
                    LOGGER.groupEnd();
                    reportTests(validTests.length, invalidTests.length);
                }
                /** Output the final stats on test failure and success rates
                 * @param {number} validCount - Number of tests where success was expected
                 * @param {number} invalidCount - Number of tests where failure was expected */
                function reportTests(validCount, invalidCount) {
                    LOGGER.group('TEST RESULTS');
                    let totalCount = validCount + invalidCount;
                    LOGGER.info(
                        `\tNUMBER OF TESTS COMPLETED:\t${runCount}\tEXPECTED:\t${totalCount}\n\t\tCOMPLETION RATIO:\t${(runCount /
                            totalCount) *
                            100}%`
                    );
                    LOGGER.info(
                        `\tNUMBER OF TESTS SUCCEEDED:\t${succeedCount}\tEXPECTED:\t${validCount}\n\t\tSUCCESS RATIO:\t\t${(succeedCount /
                            validCount) *
                            100}%`
                    );
                    LOGGER.info(
                        `\tNUMBER OF TESTS FAILED:\t\t${failedCount}\tEXPECTED:\t${invalidCount}\n\t\tFAILURE RATIO:\t\t${(failedCount /
                            invalidCount) *
                            100}%`
                    );
                    LOGGER.groupEnd();
                }
                // TODO JSDocs
                function clearResults() {
                    LOGGER.clear();
                }

                /** Test suite export object */
                const expo = {
                    runValidTests,
                    runInvalidTests,
                    runAllTests,
                    clearResults
                };
                return Object.freeze(expo);
            })();
            /** Morse code export object */
            const expo = {
                convert: {
                    toDigital: convLetterDigital,
                    toMorse: convLetterMorse,
                    fromDigital: convDigitalLetter,
                    fromMorse: convMorseLetter
                },
                tests,
                translate: {
                    toMorse: translateToMorse,
                    fromMorse: translateFromMorse
                }
            };
            return Object.freeze(expo);
        })()
    );

reload =
    window.reload ||
    Object.freeze(
        (() => {
            function js() {
                let m = document.getElementById('morseScript');
                let n = document.createElement('script');
                n.id = m.id;
                n.src = m.src.replace(/.*\/(.*\.js)/, '$1');
                n.defer = m.defer;
                n.charset = m.charset;
                document.head.removeChild(m);
                document.head.appendChild(n);
                LOGGER.clear();
            }
            const expo = { js };
            return Object.freeze(expo);
        })()
    );
