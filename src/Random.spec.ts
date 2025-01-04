import { Random } from "./Random";

const rnd1 = new Random(123);
const rnd2 = new Random(123);

function getSomeNumbers(rnd: Random) {
    const n = [];
    for (let i = 0; i < 100_000_000; i++) {
        const r = rnd.nextNumber();
        n.push(Math.floor(r*1337));
    }
    return n;
}

const r1 = getSomeNumbers(rnd1);
const r2 = getSomeNumbers(rnd2);

for (let i = 0; i < r1.length; i++) {
    const n1 = r1[i];
    const n2 = r2[i];
    if (n1 !== n2) {
        throw new Error(`${n1} and ${n2} differed at pos ${i}`);
    }
}
console.log("all equal! :)")