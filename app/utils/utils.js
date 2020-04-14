/// utility

// random by choices and probability

export function random_by_choice(n, props) {
  var rnd = Math.random();
  var sum = 0.0;
  for (var i = 0; i < n; i++) {
    sum += props[i];
    if (rnd <= sum) {
      return i;
    }
  }
  return n - 1;
}

export function slice_2d_array(arr, stX, enX, stY, enY) {
  var res = [];
  for (var i = stX; i < enX; i++) {
    res.push(arr[i].slice(stY, enY));
  }
  return res;
}

// shuffle array

export function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// convert arrat to an object

export function arrToObject(arr) {
  let obj = {};

  for (var i = 0; i < arr.length; i++) {
    let tmp = arr[i];
    obj[i] = tmp;
  }

  return obj;
}

export function objectToArr(obj) {
  let arr = [];

  for (var i = 0; i < 11; i++) {
    if (i in obj) {
      arr.push(obj[i]);
    }
  }

  return arr;
}
