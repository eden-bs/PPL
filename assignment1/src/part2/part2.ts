import * as R from "ramda";
const stringToArray = R.split("");



/* Question 1 */

export const countLetters = (str: string): { [key: string]: number } =>
  R.pipe(
    stringToArray,
    R.filter(R.complement(R.isEmpty)),
    R.map(R.toLower),
    R.reduce(
      (acc: { [key: string]: number }, letter: string) => {
        acc[letter] = acc[letter] ? acc[letter] + 1 : 1;
        return acc;
      },
      {}
    )
  )(str);
console.log(countLetters("banananana"));
/* Question 2 */

export function isPaired(str: string): boolean {
  const open_bracket = ['(', '{', '['];
  const close_bracket = [')', '}', ']'];
  const stack: string[] = [];
  let i = -1;

  for (const bracket of str) {
    if (open_bracket.indexOf(bracket) !== -1) {
      i++;
      stack[i] = bracket;
    } else if (close_bracket.indexOf(bracket) !== -1) {
      const expectedBracket = open_bracket[close_bracket.indexOf(bracket)];
      if (i === -1 || stack[i] !== expectedBracket) {
        return false;
      }
      i--;
    }
  }

  return i === -1;
}

/* Question 3 */

export type WordTree = {
  root: string;
  children: WordTree[];
}    

export const treeToSentence = (tree: WordTree): string => {
  let output: string = tree.root;
  output += " "
  for (const child of tree.children) {
      output += treeToSentence(child);
  }
  return output;
}
