function sum(a, b) {
  (function () {
    console.log("sum", {
      "typeof a === 'number'": [typeof a, '===', 'number'].join(''),
      "a > 0'": [a, '>', 0].join(''),
    })
  })();
  return a + b
}

function main() {
  const c = sum(a, b)
  CHECK(/sum/, 500)
  console.log(c)
}