/** Morse code object. Provides conversion from letters to and from morse code in two formats, morse-words or morse-bits.<br>
Each morse representation is packed as an array:
<ul>
    <li>morse-words: ['DIT', 'DAH']</li>
    <li>morse-bits: [1, 0, 1, 1, 1, 0]</li>
</ul>
Future plans include updated character set and full string translations.*/
const morse = Object.freeze(
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
                z: ['DAH', 'DAH', 'DIT', 'DIT']
            }
        };
        /** Convert a letter into an array of morse-words
         * @param {Array} conv - The letter to convert
         * @return {string} An array of morse-words */
        function convLetterMorse(conv) {
            if (MORSE.MAP[conv] === void 0) {
                throw new Error(
                    `The provided character or symbol is not mapped in this library:
\t${formatArgs(arguments)}`
                );
            }
            return MORSE.MAP[conv];
        }
        /** Convert an array of morse-words into a letter
         * @param {Array} conv - The morse-words array to convert
         * @return {string} The converted letter */
        function convMorseLetter(conv) {
            return Object.keys(MORSE.MAP).filter(k =>
                isMatch(MORSE.MAP[k], conv)
            )[0];
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
            return Object.keys(MORSE.MAP).filter(k =>
                isMatch(convMorseDigital(MORSE.MAP[k]), conv)
            )[0];
        }
        /** Convert an array of morse-words into an array of morse-bits
         * @param {Array} conv - The morse-words array to convert
         * @return {Array} An array of morse-bits */
        function convMorseDigital(conv) {
            if (
                !Array.isArray(conv) ||
                conv.filter(s => s !== 'DIT' && s !== 'DAH').length > 0
            ) {
                throw new Error(
                    `The provided morse code failed structural requirements:
\t${formatArgs(arguments)}`
                );
            }
            return conv.map(s => MORSE.SYMBOLS[s]).flat();
        }
        function convDigitalMorse(conv) {}
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
                    return 'One or more elements of the check array are incorrect';
                }
            }
            return 'OK';
        }

        /** Format the arguments passed to an function into a semi-pretty string
         * @param {Array} args - The arguments object from the original function
         * @return {string} The semi-pretty string version of the arguments*/
        function formatArgs(args) {
            function id(a) {
                return typeof a !== 'object' ? typeof a : a.constructor.name;
            }
            function gen2Str(a) {
                if (typeof a === 'object') {
                    if (!Array.isArray(a)) {
                        return Object.keys(a)
                            .filter(k => a.hasOwnProperty(k))
                            .map(k => `${k}: ${a[k]}`)
                            .join(', ');
                    }
                    return a.join(', ');
                }
                if (typeof a === 'function') {
                    return a.name;
                }
                return a;
            }
            return (
                Array.from(args)
                    .map(a => `${id(a)}: ${gen2Str(a)}`)
                    .join(', ') + '\n'
            );
        }
        /** Morse code export object */
        let expo = {
            convert: {
                toDigital: convLetterDigital,
                toMorse: convLetterMorse,
                fromDigital: convDigitalLetter,
                fromMorse: convMorseLetter
            }
            //translate: { }
        };
        return Object.freeze(expo);
    })()
);
