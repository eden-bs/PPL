
import { map } from 'ramda';
import { isStrExp, CExp, Exp, PrimOp, Program, isAppExp, isBoolExp, isDefineExp, isIfExp, isNumExp, isPrimOp, isProcExp, isProgram, isVarRef } from '../imp/L3-ast';
import { Result, bind, makeFailure, makeOk, mapResult,safe2 } from '../shared/result';

// export const l2ToPython = (exp: Exp | Program): Result<string> =>
//   isProgram(exp)
//     ? bind(mapResult(l2ToPython, exp.exps), exps => makeOk(exps.join('\n')))
//     : isBoolExp(exp)
//     ? makeOk(exp.val ? 'True' : 'False')
//     : isVarRef(exp)
//     ? makeOk(exp.var)
//     : isNumExp(exp)
//     ? makeOk(exp.val.toString())
//     : isPrimOp(exp)
//     ? makeOk(convertPrimOp(exp.op))
//     : isAppExp(exp)
//     ? isPrimOp(exp.rator)
//       ? primOpApp2Python(exp.rator, exp.rands)
//       : safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands.join(',')})`))(
//           l2ToPython(exp.rator),
//           mapResult(l2ToPython, exp.rands)
//         )
//     : isProcExp(exp)
//     ? bind(l2ToPython(exp.body[exp.body.length - 1]), body =>
//         makeOk(
//           '(' +
//             'lambda ' +
//             map((p) => p.var, exp.args).join(',') +
//             ' : ' +
//             body +
//             ')'
//         )
//       )
//     : isDefineExp(exp)
//     ? bind(l2ToPython(exp.val), val =>
//         makeOk(`${exp.var.var} = ${val}`)
//       )
//     : isIfExp(exp)
//     ? safe3((test: string, then: string, alt: string) =>
//         makeOk(`(${then} if ${test} else ${alt})`)
//       )(l2ToPython(exp.test), l2ToPython(exp.then), l2ToPython(exp.alt))
//     : makeFailure('Never');
        
//     const convertPrimOp = (op : string) : string =>
//     (op === "number?" ? "(lambda x : type(x) == int or type(x) == float)" :
//     op === "boolean?" ? "(lambda x : type(x) == bool)" :
//     op === "=" || op === "eq?" ? "==" :
//     op);

//     const safe3 = <T1, T2, T3, T4>(f: (x: T1, y: T2, z: T3) => Result<T4>): (xr: Result<T1>, yr: Result<T2>, zr: Result<T3>) => Result<T4> => (xr: Result<T1>, yr: Result<T2>, zr: Result<T3>) => bind(xr, (x: T1) => bind(yr, (y: T2) => bind(zr, (z: T3) => f(x, y, z))));

//     const primOpApp2Python = (rator: PrimOp, rands: CExp[]): Result<string> =>
//      rator.op === "not"
//     ? bind(l2ToPython(rands[0]), rand => makeOk(`(not ${rand})`))
//     : rator.op === "number?" || rator.op === "boolean?"
//     ? bind(l2ToPython(rands[0]), rand => makeOk(`${convertPrimOp(rator.op)}(${rands[0]})`))
//     : bind(mapResult(l2ToPython, rands), rands => makeOk(`(${rands.join(" " + convertPrimOp(rator.op) + " ")})`));
const convertPrimOp = (op: string): string =>
  op === "number?"
    ? "(lambda x : type(x) == int or type(x) == float)"
    : op === "boolean?"
    ? "(lambda x : type(x) == bool)"
    : op === "=" || op === "eq?"
    ? "=="
    : op;

const bindResult = <T1, T2, T3, T4>(
  f: (x: T1, y: T2, z: T3) => Result<T4>
): (xr: Result<T1>, yr: Result<T2>, zr: Result<T3>) => Result<T4> => {
  return (xr, yr, zr) =>
    bind(xr, (x) =>
      bind(yr, (y) => bind(zr, (z) => f(x, y, z)))
    );
};

const primOpApp2Python = (
  rator: PrimOp,
  args: CExp[]
): Result<string> =>
  rator.op === "not"
    ? bind(l2ToPython(args[0]), (arg) => makeOk(`(not ${arg})`))
    : rator.op === "number?" || rator.op === "boolean?"
    ? bind(l2ToPython(args[0]), (arg) =>
        makeOk(`${convertPrimOp(rator.op)}(${arg})`)
      )
    : bind(mapResult(l2ToPython, args), (args) =>
        makeOk(`(${args.join(" " + convertPrimOp(rator.op) + " ")})`)
      );

export const l2ToPython = (exp: Exp | Program): Result<string> =>
  isProgram(exp)
    ? bind(mapResult(l2ToPython, exp.exps), (exps) => makeOk(exps.join("\n")))
    : isBoolExp(exp)
    ? makeOk(exp.val ? "True" : "False")
    : isVarRef(exp)
    ? makeOk(exp.var)
    : isNumExp(exp)
    ? makeOk(exp.val.toString())
    : isPrimOp(exp)
    ? makeOk(convertPrimOp(exp.op))
    : isAppExp(exp)
    ? isPrimOp(exp.rator)
      ? primOpApp2Python(exp.rator, exp.rands)
      : safe2((rator: string, args: string[]) =>
          makeOk(`${rator}(${args.join(",")})`)
        )(l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands))
    : isProcExp(exp)
    ? bind(l2ToPython(exp.body[exp.body.length - 1]), (body) =>
        makeOk(
          "(" +
            "lambda " +
            map((p) => p.var, exp.args).join(",") +
            " : " +
            body +
            ")"
        )
      )
    : isDefineExp(exp)
    ? bind(l2ToPython(exp.val), (val) =>
        makeOk(`${exp.var.var} = ${val}`)
      )
    : isIfExp(exp)
    ? bindResult((test: string, then: string, alt: string) =>
        makeOk(`(${then} if ${test} else ${alt})`)
      )(l2ToPython(exp.test), l2ToPython(exp.then), l2ToPython(exp.alt))
    : makeFailure("Never");