/** A prototype logging device */
logger =
    window.logger ||
    Object.freeze(
        (() => {
            function indent(lv = 1, sz = 4) {
                lv = isNaN(lv) ? 1 : parseInt(lv);
                if (lv < 0) lv = 0;
                sz = isNaN(sz) ? 4 : parseInt(sz);
                if (sz < 0) sz = 0;

                return Array(lv * sz)
                    .fill(' ')
                    .join('');
            }
            /** Format the arguments passed to an function into a semi-pretty string
             * @param {Array} args - The arguments object from the original function
             * @return {string} The semi-pretty string version of the arguments*/
            function format(args, ind = 1) {
                function isObj(a) {
                    return typeof a === 'object';
                }
                function packVar(v, inn = 1) {
                    let fn;
                    switch (typeof v) {
                        case 'number':
                            fn = n => `${n}`;
                            break;
                        case 'string':
                            fn = s => `"${s}"`;
                            break;
                        case 'function':
                            fn = f => `function: ${f.name}`;
                            break;
                        case 'object':
                            fn = Array.isArray(v)
                                ? a =>
                                      `Array: [ ${a
                                          .map(o => packVar(o, inn))
                                          .join(', ')} ]`
                                : o => {
                                      let keys = Object.keys(o).filter(k =>
                                          o.hasOwnProperty(k)
                                      );
                                      let pack = keys.map(
                                          key =>
                                              `${key}: ${packVar(o[key], inn)}`
                                      );
                                      return `${
                                          o.constructor.name
                                      }: { ${pack.join(', ')} }`;
                                  };
                            break;
                        default:
                            fn = val => val;
                            break;
                    }
                    return fn(v, inn);
                }
                console.debug('NEW FORMAT');
                console.debug('args value:', args);
                let out;
                if (isObj(args)) {
                    console.debug('args→isObj');
                    if (!Array.isArray(args)) {
                        console.debug('wrapping in array');
                        args = Array.from(args);
                        console.debug('args now:', args);
                    }
                    out = args.map(a => packVar(a, ind));
                    console.debug('out after map:', out);
                    out = out.join(',\n');
                } else {
                    console.debug('args→!isObj');
                    out = packVar(args, ind);
                }
                console.debug('out value:', out);
                return out;
            }
            // function format(args) {
            //     function isObj(a) {
            //         return typeof a === 'object';
            //     }
            //     function id(a) {
            //         return isObj(a) ? a.constructor.name : typeof a;
            //     }
            //     function packVar(v, i = 1) {
            //         let fn;
            //         switch (typeof v) {
            //             case 'number':
            //                 fn = n => `${n}`;
            //                 break;
            //             case 'string':
            //                 fn = s => `"${s}"`;
            //                 break;
            //             case 'function':
            //                 fn = f => `"${f.name}"`;
            //                 break;
            //             case 'object':
            //                 fn = Array.isArray(v)
            //                     ? a => `[ ${a.join(', ')} ]`
            //                     : (o, i) => {
            //                           let keys = Object.keys(o).filter(k =>
            //                               o.hasOwnProperty(k)
            //                           );
            //                           let pack = keys.map(
            //                               key => `${key}: ${packVar(o[key], i)}`
            //                           );
            //                           return `{ ${pack.join(', ')} }`;
            //                       };
            //                 break;
            //             default:
            //                 fn = val => val;
            //                 break;
            //         }
            //         return fn(v, i);
            //     }

            //     // TODO make this prettier/better
            //     // TODO JSDocs
            //     function gen2Str(a) {
            //         if (Array.isArray(a)) {
            //             a = a.join(', ');
            //         } else if (typeof a === 'function') {
            //             a = a.name;
            //         } else if (isObj(a)) {
            //             a = Object.keys(a)
            //                 .filter(k => a.hasOwnProperty(k))
            //                 .map(
            //                     k =>
            //                         `${k}: ${
            //                             Array.isArray(a[k])
            //                                 ? `[ ${a[k].join(', ')} ]`
            //                                 : `">DWEEZIL> ${a[k]}"`
            //                         }`
            //                 )
            //                 .join('>SEMI> ');
            //         }
            //         return `${a}`;
            //     }
            //     return (
            //         (isObj(args)
            //             ? Array.from(args)
            //                   .map(
            //                       a =>
            //                           isObj(a)
            //                               ? `${id(a)}: { ${gen2Str(a)} }`
            //                               : `${id(a)}: ${gen2Str(a)}`
            //                   )
            //                   .join('>NEWB>\n')
            //             : `${gen2Str(args)}>NOTHING>`) + '\n'
            //     );
            // }
            const cons = {
                clear: console.clear,
                debug: console.debug,
                error: console.error,
                group: console.group,
                groupEnd: console.groupEnd,
                info: console.info,
                log: console.log,
                warn: console.warn,
                format
            };
            const outText = document.getElementById('output');
            let indentLv = 0;
            // TODO JSDocs
            function wrap(msg, style) {
                const child = document.createElement('div');
                if (style === 'groupEnd') {
                    return indentLv--;
                } else if (style === 'group') {
                    indentLv++;
                }
                child.className = style;
                const ind = indent(indentLv);
                child.innerHTML += `${ind}${
                    style === 'group' ? '<b>' : ''
                }${msg.replace(/\n/g, `<br>>CONV>${ind}`)}${
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
                warn: msg => wrap(msg, 'warn'),
                format
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
                        `The provided character or symbol is not mapped in this library:\n\t${LOGGER.format(
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
                        `The provided morse code failed structural requirements:\n\t${LOGGER.format(
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
                        `Invalid args:\n\t${LOGGER.format(arguments)}`
                    );
                }
                if (mode !== 'bits' && mode !== 'words') {
                    throw new Error(
                        `Invalid mode:\n\t${LOGGER.format(arguments)}`
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
            function translateFromMorse(morse, mode) {
                if (!Array.isArray(morse) || mode === void 0) {
                    throw new Error(
                        `Invalid args:\n\t${LOGGER.format(arguments)}`
                    );
                }
                if (mode !== 'bits' && mode !== 'words') {
                    throw new Error(
                        `Invalid mode:\n\t${LOGGER.format(arguments)}`
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
                while (clone.length > 0) {
                    tmp = tmp.concat(clone.splice(0, sliceSize)).flat();
                    if (isMatch(clone, lgGap)) {
                        out.push(
                            (mode === 'words'
                                ? convMorseLetter
                                : convDigitalLetter)(tmp)
                        );
                        break;
                    }
                    if (isMatch(clone.slice(0, sliceSize), smGap)) {
                        out.push(
                            (mode === 'words'
                                ? convMorseLetter
                                : convDigitalLetter)(tmp)
                        );
                        tmp = [];
                        out.push(
                            (mode === 'words'
                                ? convMorseLetter
                                : convDigitalLetter)(tmp)
                        );
                        tmp = [];
                        clone.splice(0, sliceSize);
                        continue;
                    }
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
                            return translateFromMorse(
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
                    LOGGER.warn(LOGGER.format(msg));
                }
                /** Report a successful test
                 * @param {string} msg - The success message to report */
                function testSucceeded(msg) {
                    succeedCount++;
                    LOGGER.info(LOGGER.format(msg));
                }
                /** Universal testing method.
                 * @param {string} title - The title of the test
                 * @param {function} modFN - The modification function that creates the output value
                 * @param {object} params.test - The output value to test
                 * @param {object} params.base - The expected output value  */
                function universalTest(title, modFN, params) {
                    LOGGER.group(title);
                    runCount++;
                    let formArgs = LOGGER.format(arguments);
                    try {
                        let msg = checkMatch(modFN(params.test), params.base);
                        (msg !== 'OK' ? testFailed : testSucceeded)(
                            formArgs +
                                LOGGER.format(
                                    msg !== 'OK'
                                        ? msg
                                        : msg + ' -- ' + modFN(params.test)
                                )
                        );
                    } catch (err) {
                        testFailed(
                            formArgs +
                                LOGGER.format(err.message + '\n' + err.stack)
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
                        `\tNUMBER OF TESTS FAILED:\t${failedCount}\tEXPECTED:\t${invalidCount}\n\t\tFAILURE RATIO:\t\t${(failedCount /
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
