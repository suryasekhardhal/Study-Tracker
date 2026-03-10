import {fetchCodeforcesProblem} from "./server/service/problemFetcher.service.js"

const data = await fetchCodeforcesProblem("https://codeforces.com/problemset/problem/2207/H3");

console.log(data);
