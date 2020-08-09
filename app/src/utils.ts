import { IDim } from "../types";


export function roundToNPlaces(num: number, n: number) {
  const powerOfTen = n**10;
  return Math.round((num + Number.EPSILON) * powerOfTen) / powerOfTen
}

export function arrayAdd<T extends number[]>(arr1: T, arr2: T): T {
  const newArray: number[] = [];
  for (let i = 0; i < arr1.length; i++) {
    newArray[i] = arr1[i] + arr2[i];
  }
  return newArray as T;
}

export function arrayMul<T extends number[]>(arr1: T, arr2: T): T{
  const newArray: number[] = [];
  for (let i = 0; i < arr1.length; i++) {
    newArray[i] = arr1[i] * arr2[i];
  }
  return newArray as T;
}

export function arrayScalarMul<T extends number[]>(arr1: T, num: number): T {
  return arr1.map(val => val * num) as T;
}


export function arraySquare(arr: number[]) {
  return arrayMul(arr, arr);
}

/** Subtracts arr1 from arr2 */
export function arraySub(arr1: number[], arr2: number[]) {
  if (arr1.length !== arr2.length) {
    throw new Error("Arrays not same length");
  }
  const newArray: number[] = [];
  for (let i = 0; i < arr1.length; i++) {
    newArray[i] = arr1[i] - arr2[i];
  }
  return newArray;
}

export function arrayCompare(arr1: number[], arr2: number[]) {
  if (arr1.length !== arr2.length) {
    throw new Error("Arrays not same length");
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

/** Converts rtp to xyz */
export function sphereToCartCords(r: number, t: number, p: number): IDim {
  const cords = [
    r * Math.sin(p) * Math.sin(t),
    r * Math.cos(p),
    r * Math.sin(p) * Math.cos(t),
  ] as IDim;
  return cords;
}

export function normalize<T extends number[]>(arr: T) {
  // find the length of the vec, if 0 then return 1
  const length = Math.sqrt(arr.reduce((acc, cur) => acc + cur ** 2, 0) );
  return arrayScalarMul(arr, 1 / length);
}

export function arrayDist(arr1: number[], arr2: number[]) {
  const sum = arrayAdd(arraySquare(arr1), arraySquare(arr2)).reduce((sum, current) => sum + current);
  const dist = Math.sqrt(sum);
  return dist;
}

export function arrayDot<T extends number[]>(arr1: T, arr2: T): number {
  return arr1.reduce((acc, cur, index) => acc + cur * arr2[index]);
}

export function arrayCross(arr1: IDim, arr2: IDim): IDim {
  return [
    arr1[1] * arr2[2] - arr1[2] * arr2[1],
    arr1[2] * arr2[0] - arr1[0] * arr2[2],
    arr1[0] * arr2[1] - arr1[1] * arr2[0],
  ]
}

export function getRandEle<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}