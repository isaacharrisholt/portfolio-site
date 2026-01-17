export default {
  'gleam/list': `
import gleam/dict.{type Dict}
import gleam/float
import gleam/int
import gleam/order.{type Order}

@external(erlang, "erlang", "length")
pub fn length(of list: List(a)) -> Int {
  length_loop(list, 0)
}

fn length_loop(list: List(a), count: Int) -> Int {
  case list {
    [_, ..list] -> length_loop(list, count + 1)
    [] -> count
  }
}

pub fn count(list: List(a), where predicate: fn(a) -> Bool) -> Int {
  count_loop(list, predicate, 0)
}

fn count_loop(list: List(a), predicate: fn(a) -> Bool, acc: Int) -> Int {
  case list {
    [] -> acc
    [first, ..rest] ->
      case predicate(first) {
        True -> count_loop(rest, predicate, acc + 1)
        False -> count_loop(rest, predicate, acc)
      }
  }
}

@external(erlang, "lists", "reverse")
pub fn reverse(list: List(a)) -> List(a) {
  reverse_and_prepend(list, [])
}

@external(erlang, "lists", "reverse")
fn reverse_and_prepend(list prefix: List(a), to suffix: List(a)) -> List(a) {
  case prefix {
    [] -> suffix
    [first, ..rest] -> reverse_and_prepend(list: rest, to: [first, ..suffix])
  }
}

pub fn is_empty(list: List(a)) -> Bool {
  list == []
}

pub fn contains(list: List(a), any elem: a) -> Bool {
  case list {
    [] -> False
    [first, ..] if first == elem -> True
    [_, ..rest] -> contains(rest, elem)
  }
}

pub fn first(list: List(a)) -> Result(a, Nil) {
  case list {
    [] -> Error(Nil)
    [first, ..] -> Ok(first)
  }
}

pub fn rest(list: List(a)) -> Result(List(a), Nil) {
  case list {
    [] -> Error(Nil)
    [_, ..rest] -> Ok(rest)
  }
}

pub fn group(list: List(v), by key: fn(v) -> k) -> Dict(k, List(v)) {
  dict.group(key, list)
}

pub fn filter(list: List(a), keeping predicate: fn(a) -> Bool) -> List(a) {
  filter_loop(list, predicate, [])
}

fn filter_loop(list: List(a), fun: fn(a) -> Bool, acc: List(a)) -> List(a) {
  case list {
    [] -> reverse(acc)
    [first, ..rest] -> {
      let new_acc = case fun(first) {
        True -> [first, ..acc]
        False -> acc
      }
      filter_loop(rest, fun, new_acc)
    }
  }
}

pub fn filter_map(list: List(a), with fun: fn(a) -> Result(b, e)) -> List(b) {
  filter_map_loop(list, fun, [])
}

fn filter_map_loop(
  list: List(a),
  fun: fn(a) -> Result(b, e),
  acc: List(b),
) -> List(b) {
  case list {
    [] -> reverse(acc)
    [first, ..rest] -> {
      let new_acc = case fun(first) {
        Ok(first) -> [first, ..acc]
        Error(_) -> acc
      }
      filter_map_loop(rest, fun, new_acc)
    }
  }
}

pub fn map(list: List(a), with fun: fn(a) -> b) -> List(b) {
  map_loop(list, fun, [])
}

fn map_loop(list: List(a), fun: fn(a) -> b, acc: List(b)) -> List(b) {
  case list {
    [] -> reverse(acc)
    [first, ..rest] -> map_loop(rest, fun, [fun(first), ..acc])
  }
}

pub fn map2(list1: List(a), list2: List(b), with fun: fn(a, b) -> c) -> List(c) {
  map2_loop(list1, list2, fun, [])
}

fn map2_loop(
  list1: List(a),
  list2: List(b),
  fun: fn(a, b) -> c,
  acc: List(c),
) -> List(c) {
  case list1, list2 {
    [], _ | _, [] -> reverse(acc)
    [a, ..as_], [b, ..bs] -> map2_loop(as_, bs, fun, [fun(a, b), ..acc])
  }
}

pub fn map_fold(
  over list: List(a),
  from initial: acc,
  with fun: fn(acc, a) -> #(acc, b),
) -> #(acc, List(b)) {
  map_fold_loop(list, fun, initial, [])
}

fn map_fold_loop(
  list: List(a),
  fun: fn(acc, a) -> #(acc, b),
  acc: acc,
  list_acc: List(b),
) -> #(acc, List(b)) {
  case list {
    [] -> #(acc, reverse(list_acc))
    [first, ..rest] -> {
      let #(acc, first) = fun(acc, first)
      map_fold_loop(rest, fun, acc, [first, ..list_acc])
    }
  }
}

pub fn index_map(list: List(a), with fun: fn(a, Int) -> b) -> List(b) {
  index_map_loop(list, fun, 0, [])
}

fn index_map_loop(
  list: List(a),
  fun: fn(a, Int) -> b,
  index: Int,
  acc: List(b),
) -> List(b) {
  case list {
    [] -> reverse(acc)
    [first, ..rest] -> {
      let acc = [fun(first, index), ..acc]
      index_map_loop(rest, fun, index + 1, acc)
    }
  }
}

pub fn try_map(
  over list: List(a),
  with fun: fn(a) -> Result(b, e),
) -> Result(List(b), e) {
  try_map_loop(list, fun, [])
}

fn try_map_loop(
  list: List(a),
  fun: fn(a) -> Result(b, e),
  acc: List(b),
) -> Result(List(b), e) {
  case list {
    [] -> Ok(reverse(acc))
    [first, ..rest] ->
      case fun(first) {
        Ok(first) -> try_map_loop(rest, fun, [first, ..acc])
        Error(error) -> Error(error)
      }
  }
}

pub fn drop(from list: List(a), up_to n: Int) -> List(a) {
  case n <= 0 {
    True -> list
    False ->
      case list {
        [] -> []
        [_, ..rest] -> drop(rest, n - 1)
      }
  }
}

pub fn take(from list: List(a), up_to n: Int) -> List(a) {
  take_loop(list, n, [])
}

fn take_loop(list: List(a), n: Int, acc: List(a)) -> List(a) {
  case n <= 0 {
    True -> reverse(acc)
    False ->
      case list {
        [] -> reverse(acc)
        [first, ..rest] -> take_loop(rest, n - 1, [first, ..acc])
      }
  }
}

pub fn new() -> List(a) {
  []
}

pub fn wrap(item: a) -> List(a) {
  [item]
}

@external(erlang, "lists", "append")
pub fn append(first: List(a), second: List(a)) -> List(a) {
  append_loop(reverse(first), second)
}

fn append_loop(first: List(a), second: List(a)) -> List(a) {
  case first {
    [] -> second
    [first, ..rest] -> append_loop(rest, [first, ..second])
  }
}

pub fn prepend(to list: List(a), this item: a) -> List(a) {
  [item, ..list]
}

@external(erlang, "lists", "append")
pub fn flatten(lists: List(List(a))) -> List(a) {
  flatten_loop(lists, [])
}

fn flatten_loop(lists: List(List(a)), acc: List(a)) -> List(a) {
  case lists {
    [] -> reverse(acc)
    [list, ..further_lists] ->
      flatten_loop(further_lists, reverse_and_prepend(list, to: acc))
  }
}

pub fn flat_map(over list: List(a), with fun: fn(a) -> List(b)) -> List(b) {
  flatten(map(list, fun))
}

pub fn fold(
  over list: List(a),
  from initial: acc,
  with fun: fn(acc, a) -> acc,
) -> acc {
  case list {
    [] -> initial
    [first, ..rest] -> fold(rest, fun(initial, first), fun)
  }
}

pub fn fold_right(
  over list: List(a),
  from initial: acc,
  with fun: fn(acc, a) -> acc,
) -> acc {
  case list {
    [] -> initial
    [first, ..rest] -> fun(fold_right(rest, initial, fun), first)
  }
}

pub fn index_fold(
  over list: List(a),
  from initial: acc,
  with fun: fn(acc, a, Int) -> acc,
) -> acc {
  index_fold_loop(list, initial, fun, 0)
}

fn index_fold_loop(
  over: List(a),
  acc: acc,
  with: fn(acc, a, Int) -> acc,
  index: Int,
) -> acc {
  case over {
    [] -> acc
    [first, ..rest] ->
      index_fold_loop(rest, with(acc, first, index), with, index + 1)
  }
}

pub fn try_fold(
  over list: List(a),
  from initial: acc,
  with fun: fn(acc, a) -> Result(acc, e),
) -> Result(acc, e) {
  case list {
    [] -> Ok(initial)
    [first, ..rest] ->
      case fun(initial, first) {
        Ok(result) -> try_fold(rest, result, fun)
        Error(_) as error -> error
      }
  }
}

pub type ContinueOrStop(a) {
  Continue(a)
  Stop(a)
}

pub fn fold_until(
  over list: List(a),
  from initial: acc,
  with fun: fn(acc, a) -> ContinueOrStop(acc),
) -> acc {
  case list {
    [] -> initial
    [first, ..rest] ->
      case fun(initial, first) {
        Continue(next_accumulator) -> fold_until(rest, next_accumulator, fun)
        Stop(b) -> b
      }
  }
}

pub fn find(
  in list: List(a),
  one_that is_desired: fn(a) -> Bool,
) -> Result(a, Nil) {
  case list {
    [] -> Error(Nil)
    [first, ..rest] ->
      case is_desired(first) {
        True -> Ok(first)
        False -> find(in: rest, one_that: is_desired)
      }
  }
}

pub fn find_map(
  in list: List(a),
  with fun: fn(a) -> Result(b, c),
) -> Result(b, Nil) {
  case list {
    [] -> Error(Nil)
    [first, ..rest] ->
      case fun(first) {
        Ok(first) -> Ok(first)
        Error(_) -> find_map(in: rest, with: fun)
      }
  }
}

pub fn all(in list: List(a), satisfying predicate: fn(a) -> Bool) -> Bool {
  case list {
    [] -> True
    [first, ..rest] ->
      case predicate(first) {
        True -> all(rest, predicate)
        False -> False
      }
  }
}

pub fn any(in list: List(a), satisfying predicate: fn(a) -> Bool) -> Bool {
  case list {
    [] -> False
    [first, ..rest] ->
      case predicate(first) {
        True -> True
        False -> any(rest, predicate)
      }
  }
}

pub fn zip(list: List(a), with other: List(b)) -> List(#(a, b)) {
  zip_loop(list, other, [])
}

fn zip_loop(one: List(a), other: List(b), acc: List(#(a, b))) -> List(#(a, b)) {
  case one, other {
    [first_one, ..rest_one], [first_other, ..rest_other] ->
      zip_loop(rest_one, rest_other, [#(first_one, first_other), ..acc])
    _, _ -> reverse(acc)
  }
}

pub fn strict_zip(
  list: List(a),
  with other: List(b),
) -> Result(List(#(a, b)), Nil) {
  strict_zip_loop(list, other, [])
}

fn strict_zip_loop(
  one: List(a),
  other: List(b),
  acc: List(#(a, b)),
) -> Result(List(#(a, b)), Nil) {
  case one, other {
    [], [] -> Ok(reverse(acc))
    [], _ | _, [] -> Error(Nil)
    [first_one, ..rest_one], [first_other, ..rest_other] ->
      strict_zip_loop(rest_one, rest_other, [#(first_one, first_other), ..acc])
  }
}

pub fn unzip(input: List(#(a, b))) -> #(List(a), List(b)) {
  unzip_loop(input, [], [])
}

fn unzip_loop(
  input: List(#(a, b)),
  one: List(a),
  other: List(b),
) -> #(List(a), List(b)) {
  case input {
    [] -> #(reverse(one), reverse(other))
    [#(first_one, first_other), ..rest] ->
      unzip_loop(rest, [first_one, ..one], [first_other, ..other])
  }
}

pub fn intersperse(list: List(a), with elem: a) -> List(a) {
  case list {
    [] | [_] -> list
    [first, ..rest] -> intersperse_loop(rest, elem, [first])
  }
}

fn intersperse_loop(list: List(a), separator: a, acc: List(a)) -> List(a) {
  case list {
    [] -> reverse(acc)
    [first, ..rest] ->
      intersperse_loop(rest, separator, [first, separator, ..acc])
  }
}

pub fn unique(list: List(a)) -> List(a) {
  unique_loop(list, dict.new(), [])
}

fn unique_loop(list: List(a), seen: Dict(a, Nil), acc: List(a)) -> List(a) {
  case list {
    [] -> reverse(acc)
    [first, ..rest] ->
      case dict.has_key(seen, first) {
        True -> unique_loop(rest, seen, acc)
        False ->
          unique_loop(rest, dict.insert(seen, first, Nil), [first, ..acc])
      }
  }
}

pub fn sort(list: List(a), by compare: fn(a, a) -> Order) -> List(a) {
  case list {
    [] -> []
    [x] -> [x]

    [x, y, ..rest] -> {
      let direction = case compare(x, y) {
        order.Lt | order.Eq -> Ascending
        order.Gt -> Descending
      }

      let sequences = sequences(rest, compare, [x], direction, y, [])
      merge_all(sequences, Ascending, compare)
    }
  }
}

type Sorting {
  Ascending
  Descending
}

fn sequences(
  list: List(a),
  compare: fn(a, a) -> Order,
  growing: List(a),
  direction: Sorting,
  prev: a,
  acc: List(List(a)),
) -> List(List(a)) {
  let growing = [prev, ..growing]

  case list {
    [] ->
      case direction {
        Ascending -> [reverse(growing), ..acc]
        Descending -> [growing, ..acc]
      }

    [new, ..rest] ->
      case compare(prev, new), direction {
        order.Gt, Descending | order.Lt, Ascending | order.Eq, Ascending ->
          sequences(rest, compare, growing, direction, new, acc)

        order.Gt, Ascending | order.Lt, Descending | order.Eq, Descending -> {
          let acc = case direction {
            Ascending -> [reverse(growing), ..acc]
            Descending -> [growing, ..acc]
          }
          case rest {
            [] -> [[new], ..acc]

            [next, ..rest] -> {
              let direction = case compare(new, next) {
                order.Lt | order.Eq -> Ascending
                order.Gt -> Descending
              }
              sequences(rest, compare, [new], direction, next, acc)
            }
          }
        }
      }
  }
}

fn merge_all(
  sequences: List(List(a)),
  direction: Sorting,
  compare: fn(a, a) -> Order,
) -> List(a) {
  case sequences, direction {
    [], _ -> []

    [sequence], Ascending -> sequence

    [sequence], Descending -> reverse(sequence)

    _, Ascending -> {
      let sequences = merge_ascending_pairs(sequences, compare, [])
      merge_all(sequences, Descending, compare)
    }

    _, Descending -> {
      let sequences = merge_descending_pairs(sequences, compare, [])
      merge_all(sequences, Ascending, compare)
    }
  }
}

fn merge_ascending_pairs(
  sequences: List(List(a)),
  compare: fn(a, a) -> Order,
  acc: List(List(a)),
) {
  case sequences {
    [] -> reverse(acc)

    [sequence] -> reverse([reverse(sequence), ..acc])

    [ascending1, ascending2, ..rest] -> {
      let descending = merge_ascendings(ascending1, ascending2, compare, [])
      merge_ascending_pairs(rest, compare, [descending, ..acc])
    }
  }
}

fn merge_descending_pairs(
  sequences: List(List(a)),
  compare: fn(a, a) -> Order,
  acc: List(List(a)),
) {
  case sequences {
    [] -> reverse(acc)

    [sequence] -> reverse([reverse(sequence), ..acc])

    [descending1, descending2, ..rest] -> {
      let ascending = merge_descendings(descending1, descending2, compare, [])
      merge_descending_pairs(rest, compare, [ascending, ..acc])
    }
  }
}

fn merge_ascendings(
  list1: List(a),
  list2: List(a),
  compare: fn(a, a) -> Order,
  acc: List(a),
) -> List(a) {
  case list1, list2 {
    [], list | list, [] -> reverse_and_prepend(list, acc)

    [first1, ..rest1], [first2, ..rest2] ->
      case compare(first1, first2) {
        order.Lt -> merge_ascendings(rest1, list2, compare, [first1, ..acc])
        order.Gt | order.Eq ->
          merge_ascendings(list1, rest2, compare, [first2, ..acc])
      }
  }
}

fn merge_descendings(
  list1: List(a),
  list2: List(a),
  compare: fn(a, a) -> Order,
  acc: List(a),
) -> List(a) {
  case list1, list2 {
    [], list | list, [] -> reverse_and_prepend(list, acc)
    [first1, ..rest1], [first2, ..rest2] ->
      case compare(first1, first2) {
        order.Lt -> merge_descendings(list1, rest2, compare, [first2, ..acc])
        order.Gt | order.Eq ->
          merge_descendings(rest1, list2, compare, [first1, ..acc])
      }
  }
}

pub fn range(from start: Int, to stop: Int) -> List(Int) {
  range_loop(start, stop, [])
}

fn range_loop(start: Int, stop: Int, acc: List(Int)) -> List(Int) {
  case int.compare(start, stop) {
    order.Eq -> [stop, ..acc]
    order.Gt -> range_loop(start, stop + 1, [stop, ..acc])
    order.Lt -> range_loop(start, stop - 1, [stop, ..acc])
  }
}

pub fn repeat(item a: a, times times: Int) -> List(a) {
  repeat_loop(a, times, [])
}

fn repeat_loop(item: a, times: Int, acc: List(a)) -> List(a) {
  case times <= 0 {
    True -> acc
    False -> repeat_loop(item, times - 1, [item, ..acc])
  }
}

pub fn split(list list: List(a), at index: Int) -> #(List(a), List(a)) {
  split_loop(list, index, [])
}

fn split_loop(list: List(a), n: Int, taken: List(a)) -> #(List(a), List(a)) {
  case n <= 0 {
    True -> #(reverse(taken), list)
    False ->
      case list {
        [] -> #(reverse(taken), [])
        [first, ..rest] -> split_loop(rest, n - 1, [first, ..taken])
      }
  }
}

pub fn split_while(
  list list: List(a),
  satisfying predicate: fn(a) -> Bool,
) -> #(List(a), List(a)) {
  split_while_loop(list, predicate, [])
}

fn split_while_loop(
  list: List(a),
  f: fn(a) -> Bool,
  acc: List(a),
) -> #(List(a), List(a)) {
  case list {
    [] -> #(reverse(acc), [])
    [first, ..rest] ->
      case f(first) {
        True -> split_while_loop(rest, f, [first, ..acc])
        False -> #(reverse(acc), list)
      }
  }
}

pub fn key_find(
  in keyword_list: List(#(k, v)),
  find desired_key: k,
) -> Result(v, Nil) {
  find_map(keyword_list, fn(keyword) {
    let #(key, value) = keyword
    case key == desired_key {
      True -> Ok(value)
      False -> Error(Nil)
    }
  })
}

pub fn key_filter(
  in keyword_list: List(#(k, v)),
  find desired_key: k,
) -> List(v) {
  filter_map(keyword_list, fn(keyword) {
    let #(key, value) = keyword
    case key == desired_key {
      True -> Ok(value)
      False -> Error(Nil)
    }
  })
}

pub fn key_pop(list: List(#(k, v)), key: k) -> Result(#(v, List(#(k, v))), Nil) {
  key_pop_loop(list, key, [])
}

fn key_pop_loop(
  list: List(#(k, v)),
  key: k,
  checked: List(#(k, v)),
) -> Result(#(v, List(#(k, v))), Nil) {
  case list {
    [] -> Error(Nil)
    [#(k, v), ..rest] if k == key ->
      Ok(#(v, reverse_and_prepend(checked, rest)))
    [first, ..rest] -> key_pop_loop(rest, key, [first, ..checked])
  }
}

pub fn key_set(list: List(#(k, v)), key: k, value: v) -> List(#(k, v)) {
  key_set_loop(list, key, value, [])
}

fn key_set_loop(
  list: List(#(k, v)),
  key: k,
  value: v,
  inspected: List(#(k, v)),
) -> List(#(k, v)) {
  case list {
    [#(k, _), ..rest] if k == key ->
      reverse_and_prepend(inspected, [#(k, value), ..rest])
    [first, ..rest] -> key_set_loop(rest, key, value, [first, ..inspected])
    [] -> reverse([#(key, value), ..inspected])
  }
}

pub fn each(list: List(a), f: fn(a) -> b) -> Nil {
  case list {
    [] -> Nil
    [first, ..rest] -> {
      f(first)
      each(rest, f)
    }
  }
}

pub fn try_each(
  over list: List(a),
  with fun: fn(a) -> Result(b, e),
) -> Result(Nil, e) {
  case list {
    [] -> Ok(Nil)
    [first, ..rest] ->
      case fun(first) {
        Ok(_) -> try_each(over: rest, with: fun)
        Error(e) -> Error(e)
      }
  }
}

pub fn partition(
  list: List(a),
  with categorise: fn(a) -> Bool,
) -> #(List(a), List(a)) {
  partition_loop(list, categorise, [], [])
}

fn partition_loop(list, categorise, trues, falses) {
  case list {
    [] -> #(reverse(trues), reverse(falses))
    [first, ..rest] ->
      case categorise(first) {
        True -> partition_loop(rest, categorise, [first, ..trues], falses)
        False -> partition_loop(rest, categorise, trues, [first, ..falses])
      }
  }
}

pub fn permutations(list: List(a)) -> List(List(a)) {
  case list {
    [] -> [[]]
    l -> permutation_zip(l, [], [])
  }
}

fn permutation_zip(
  list: List(a),
  rest: List(a),
  acc: List(List(a)),
) -> List(List(a)) {
  case list {
    [] -> reverse(acc)
    [head, ..tail] ->
      permutation_prepend(
        head,
        permutations(reverse_and_prepend(rest, tail)),
        tail,
        [head, ..rest],
        acc,
      )
  }
}

fn permutation_prepend(
  el: a,
  permutations: List(List(a)),
  list_1: List(a),
  list_2: List(a),
  acc: List(List(a)),
) -> List(List(a)) {
  case permutations {
    [] -> permutation_zip(list_1, list_2, acc)
    [head, ..tail] ->
      permutation_prepend(el, tail, list_1, list_2, [[el, ..head], ..acc])
  }
}

pub fn window(list: List(a), by n: Int) -> List(List(a)) {
  case n <= 0 {
    True -> []
    False -> window_loop([], list, n)
  }
}

fn window_loop(acc: List(List(a)), list: List(a), n: Int) -> List(List(a)) {
  let window = take(list, n)

  case length(window) == n {
    True -> window_loop([window, ..acc], drop(list, 1), n)
    False -> reverse(acc)
  }
}

pub fn window_by_2(list: List(a)) -> List(#(a, a)) {
  zip(list, drop(list, 1))
}

pub fn drop_while(
  in list: List(a),
  satisfying predicate: fn(a) -> Bool,
) -> List(a) {
  case list {
    [] -> []
    [first, ..rest] ->
      case predicate(first) {
        True -> drop_while(rest, predicate)
        False -> [first, ..rest]
      }
  }
}

pub fn take_while(
  in list: List(a),
  satisfying predicate: fn(a) -> Bool,
) -> List(a) {
  take_while_loop(list, predicate, [])
}

fn take_while_loop(
  list: List(a),
  predicate: fn(a) -> Bool,
  acc: List(a),
) -> List(a) {
  case list {
    [] -> reverse(acc)
    [first, ..rest] ->
      case predicate(first) {
        True -> take_while_loop(rest, predicate, [first, ..acc])
        False -> reverse(acc)
      }
  }
}

pub fn chunk(in list: List(a), by f: fn(a) -> k) -> List(List(a)) {
  case list {
    [] -> []
    [first, ..rest] -> chunk_loop(rest, f, f(first), [first], [])
  }
}

fn chunk_loop(
  list: List(a),
  f: fn(a) -> k,
  previous_key: k,
  current_chunk: List(a),
  acc: List(List(a)),
) -> List(List(a)) {
  case list {
    [first, ..rest] -> {
      let key = f(first)
      case key == previous_key {
        True -> chunk_loop(rest, f, key, [first, ..current_chunk], acc)
        False -> {
          let new_acc = [reverse(current_chunk), ..acc]
          chunk_loop(rest, f, key, [first], new_acc)
        }
      }
    }
    [] -> reverse([reverse(current_chunk), ..acc])
  }
}

pub fn sized_chunk(in list: List(a), into count: Int) -> List(List(a)) {
  sized_chunk_loop(list, count, count, [], [])
}

fn sized_chunk_loop(
  list: List(a),
  count: Int,
  left: Int,
  current_chunk: List(a),
  acc: List(List(a)),
) -> List(List(a)) {
  case list {
    [] ->
      case current_chunk {
        [] -> reverse(acc)
        remaining -> reverse([reverse(remaining), ..acc])
      }
    [first, ..rest] -> {
      let chunk = [first, ..current_chunk]
      case left > 1 {
        True -> sized_chunk_loop(rest, count, left - 1, chunk, acc)
        False ->
          sized_chunk_loop(rest, count, count, [], [reverse(chunk), ..acc])
      }
    }
  }
}

pub fn reduce(over list: List(a), with fun: fn(a, a) -> a) -> Result(a, Nil) {
  case list {
    [] -> Error(Nil)
    [first, ..rest] -> Ok(fold(rest, first, fun))
  }
}

pub fn scan(
  over list: List(a),
  from initial: acc,
  with fun: fn(acc, a) -> acc,
) -> List(acc) {
  scan_loop(list, initial, [], fun)
}

fn scan_loop(
  list: List(a),
  accumulator: acc,
  accumulated: List(acc),
  fun: fn(acc, a) -> acc,
) -> List(acc) {
  case list {
    [] -> reverse(accumulated)
    [first, ..rest] -> {
      let next = fun(accumulator, first)
      scan_loop(rest, next, [next, ..accumulated], fun)
    }
  }
}

pub fn last(list: List(a)) -> Result(a, Nil) {
  case list {
    [] -> Error(Nil)
    [last] -> Ok(last)
    [_, ..rest] -> last(rest)
  }
}

pub fn combinations(items: List(a), by n: Int) -> List(List(a)) {
  case n, items {
    0, _ -> [[]]
    _, [] -> []
    _, [first, ..rest] ->
      rest
      |> combinations(n - 1)
      |> map(fn(combination) { [first, ..combination] })
      |> reverse
      |> fold(combinations(rest, n), fn(acc, c) { [c, ..acc] })
  }
}

pub fn combination_pairs(items: List(a)) -> List(#(a, a)) {
  combination_pairs_loop(items, [])
}

fn combination_pairs_loop(items: List(a), acc: List(#(a, a))) -> List(#(a, a)) {
  case items {
    [] -> reverse(acc)
    [first, ..rest] -> {
      let first_combinations = map(rest, with: fn(other) { #(first, other) })
      let acc = reverse_and_prepend(first_combinations, acc)
      combination_pairs_loop(rest, acc)
    }
  }
}

pub fn interleave(list: List(List(a))) -> List(a) {
  list
  |> transpose
  |> flatten
}

pub fn transpose(list_of_lists: List(List(a))) -> List(List(a)) {
  transpose_loop(list_of_lists, [])
}

fn transpose_loop(rows: List(List(a)), columns: List(List(a))) -> List(List(a)) {
  case rows {
    [] -> reverse(columns)
    _ -> {
      let #(column, rest) = take_firsts(rows, [], [])
      case column {
        [_, ..] -> transpose_loop(rest, [column, ..columns])
        [] -> transpose_loop(rest, columns)
      }
    }
  }
}

fn take_firsts(
  rows: List(List(a)),
  column: List(a),
  remaining_rows: List(List(a)),
) -> #(List(a), List(List(a))) {
  case rows {
    [] -> #(reverse(column), reverse(remaining_rows))
    [[], ..rest] -> take_firsts(rest, column, remaining_rows)
    [[first, ..remaining_row], ..rest_rows] -> {
      let remaining_rows = [remaining_row, ..remaining_rows]
      take_firsts(rest_rows, [first, ..column], remaining_rows)
    }
  }
}

pub fn shuffle(list: List(a)) -> List(a) {
  list
  |> fold(from: [], with: fn(acc, a) { [#(float.random(), a), ..acc] })
  |> do_shuffle_by_pair_indexes()
  |> shuffle_pair_unwrap_loop([])
}

fn shuffle_pair_unwrap_loop(list: List(#(Float, a)), acc: List(a)) -> List(a) {
  case list {
    [] -> acc
    [elem_pair, ..enumerable] ->
      shuffle_pair_unwrap_loop(enumerable, [elem_pair.1, ..acc])
  }
}

fn do_shuffle_by_pair_indexes(
  list_of_pairs: List(#(Float, a)),
) -> List(#(Float, a)) {
  sort(list_of_pairs, fn(a_pair: #(Float, a), b_pair: #(Float, a)) -> Order {
    float.compare(a_pair.0, b_pair.0)
  })
}

pub fn max(
  over list: List(a),
  with compare: fn(a, a) -> Order,
) -> Result(a, Nil) {
  case list {
    [] -> Error(Nil)
    [first, ..rest] -> Ok(max_loop(rest, compare, first))
  }
}

fn max_loop(list, compare, max) {
  case list {
    [] -> max
    [first, ..rest] ->
      case compare(first, max) {
        order.Gt -> max_loop(rest, compare, first)
        order.Lt | order.Eq -> max_loop(rest, compare, max)
      }
  }
}

pub fn sample(from list: List(a), up_to n: Int) -> List(a) {
  let #(reservoir, rest) = build_reservoir(from: list, sized: n)

  case dict.is_empty(reservoir) {
    True -> []

    False -> {
      let w = float.exponential(log_random() /. int.to_float(n))
      dict.values(sample_loop(rest, reservoir, n, w))
    }
  }
}

fn sample_loop(
  list: List(a),
  reservoir: Dict(Int, a),
  n: Int,
  w: Float,
) -> Dict(Int, a) {
  let skip = {
    let assert Ok(log) = float.logarithm(1.0 -. w)
    float.round(float.floor(log_random() /. log))
  }

  case drop(list, skip) {
    [] -> reservoir
    [first, ..rest] -> {
      let reservoir = dict.insert(reservoir, int.random(n), first)
      let w = w *. float.exponential(log_random() /. int.to_float(n))
      sample_loop(rest, reservoir, n, w)
    }
  }
}

const min_positive = 2.2250738585072014e-308

fn log_random() -> Float {
  let assert Ok(random) = float.logarithm(float.random() +. min_positive)
  random
}

fn build_reservoir(from list: List(a), sized n: Int) -> #(Dict(Int, a), List(a)) {
  build_reservoir_loop(list, n, dict.new())
}

fn build_reservoir_loop(
  list: List(a),
  size: Int,
  reservoir: Dict(Int, a),
) -> #(Dict(Int, a), List(a)) {
  let reservoir_size = dict.size(reservoir)
  case reservoir_size >= size {
    True -> #(reservoir, list)

    False ->
      case list {
        [] -> #(reservoir, [])
        [first, ..rest] -> {
          let reservoir = dict.insert(reservoir, reservoir_size, first)
          build_reservoir_loop(rest, size, reservoir)
        }
      }
  }
}`,
  'gleam/io': `@external(erlang, "gleam_stdlib", "print")
@external(javascript, "../gleam_stdlib.mjs", "print")
pub fn print(string: String) -> Nil

@external(erlang, "gleam_stdlib", "print_error")
@external(javascript, "../gleam_stdlib.mjs", "print_error")
pub fn print_error(string: String) -> Nil

@external(erlang, "gleam_stdlib", "println")
@external(javascript, "../gleam_stdlib.mjs", "console_log")
pub fn println(string: String) -> Nil

@external(erlang, "gleam_stdlib", "println_error")
@external(javascript, "../gleam_stdlib.mjs", "console_error")
pub fn println_error(string: String) -> Nil`,
  'gleam/int': `
import gleam/float
import gleam/order.{type Order}

pub fn absolute_value(x: Int) -> Int {
  case x >= 0 {
    True -> x
    False -> x * -1
  }
}

pub fn power(base: Int, of exponent: Float) -> Result(Float, Nil) {
  base
  |> to_float
  |> float.power(exponent)
}

pub fn square_root(x: Int) -> Result(Float, Nil) {
  x
  |> to_float
  |> float.square_root()
}

@external(erlang, "gleam_stdlib", "parse_int")
@external(javascript, "../gleam_stdlib.mjs", "parse_int")
pub fn parse(string: String) -> Result(Int, Nil)

pub fn base_parse(string: String, base: Int) -> Result(Int, Nil) {
  case base >= 2 && base <= 36 {
    True -> do_base_parse(string, base)
    False -> Error(Nil)
  }
}

@external(erlang, "gleam_stdlib", "int_from_base_string")
@external(javascript, "../gleam_stdlib.mjs", "int_from_base_string")
fn do_base_parse(a: String, b: Int) -> Result(Int, Nil)

@external(erlang, "erlang", "integer_to_binary")
@external(javascript, "../gleam_stdlib.mjs", "to_string")
pub fn to_string(x: Int) -> String

pub fn to_base_string(x: Int, base: Int) -> Result(String, Nil) {
  case base >= 2 && base <= 36 {
    True -> Ok(do_to_base_string(x, base))
    False -> Error(Nil)
  }
}

@external(erlang, "erlang", "integer_to_binary")
@external(javascript, "../gleam_stdlib.mjs", "int_to_base_string")
fn do_to_base_string(a: Int, b: Int) -> String

pub fn to_base2(x: Int) -> String {
  do_to_base_string(x, 2)
}

pub fn to_base8(x: Int) -> String {
  do_to_base_string(x, 8)
}

pub fn to_base16(x: Int) -> String {
  do_to_base_string(x, 16)
}

pub fn to_base36(x: Int) -> String {
  do_to_base_string(x, 36)
}

@external(erlang, "erlang", "float")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn to_float(x: Int) -> Float

pub fn clamp(x: Int, min min_bound: Int, max max_bound: Int) -> Int {
  case min_bound >= max_bound {
    True -> x |> min(min_bound) |> max(max_bound)
    False -> x |> min(max_bound) |> max(min_bound)
  }
}

pub fn compare(a: Int, with b: Int) -> Order {
  case a == b {
    True -> order.Eq
    False ->
      case a < b {
        True -> order.Lt
        False -> order.Gt
      }
  }
}

pub fn min(a: Int, b: Int) -> Int {
  case a < b {
    True -> a
    False -> b
  }
}

pub fn max(a: Int, b: Int) -> Int {
  case a > b {
    True -> a
    False -> b
  }
}

pub fn is_even(x: Int) -> Bool {
  x % 2 == 0
}

pub fn is_odd(x: Int) -> Bool {
  x % 2 != 0
}

pub fn negate(x: Int) -> Int {
  -1 * x
}

pub fn sum(numbers: List(Int)) -> Int {
  sum_loop(numbers, 0)
}

fn sum_loop(numbers: List(Int), initial: Int) -> Int {
  case numbers {
    [first, ..rest] -> sum_loop(rest, first + initial)
    [] -> initial
  }
}

pub fn product(numbers: List(Int)) -> Int {
  product_loop(numbers, 1)
}

fn product_loop(numbers: List(Int), initial: Int) -> Int {
  case numbers {
    [first, ..rest] -> product_loop(rest, first * initial)
    [] -> initial
  }
}

pub fn random(max: Int) -> Int {
  { float.random() *. to_float(max) }
  |> float.floor
  |> float.round
}

pub fn divide(dividend: Int, by divisor: Int) -> Result(Int, Nil) {
  case divisor {
    0 -> Error(Nil)
    divisor -> Ok(dividend / divisor)
  }
}

pub fn remainder(dividend: Int, by divisor: Int) -> Result(Int, Nil) {
  case divisor {
    0 -> Error(Nil)
    divisor -> Ok(dividend % divisor)
  }
}

pub fn modulo(dividend: Int, by divisor: Int) -> Result(Int, Nil) {
  case divisor {
    0 -> Error(Nil)
    _ -> {
      let remainder = dividend % divisor
      case remainder * divisor < 0 {
        True -> Ok(remainder + divisor)
        False -> Ok(remainder)
      }
    }
  }
}

pub fn floor_divide(dividend: Int, by divisor: Int) -> Result(Int, Nil) {
  case divisor {
    0 -> Error(Nil)
    divisor ->
      case dividend * divisor < 0 && dividend % divisor != 0 {
        True -> Ok(dividend / divisor - 1)
        False -> Ok(dividend / divisor)
      }
  }
}

pub fn add(a: Int, b: Int) -> Int {
  a + b
}

pub fn multiply(a: Int, b: Int) -> Int {
  a * b
}

pub fn subtract(a: Int, b: Int) -> Int {
  a - b
}

@external(erlang, "erlang", "band")
@external(javascript, "../gleam_stdlib.mjs", "bitwise_and")
pub fn bitwise_and(x: Int, y: Int) -> Int

@external(erlang, "erlang", "bnot")
@external(javascript, "../gleam_stdlib.mjs", "bitwise_not")
pub fn bitwise_not(x: Int) -> Int

@external(erlang, "erlang", "bor")
@external(javascript, "../gleam_stdlib.mjs", "bitwise_or")
pub fn bitwise_or(x: Int, y: Int) -> Int

@external(erlang, "erlang", "bxor")
@external(javascript, "../gleam_stdlib.mjs", "bitwise_exclusive_or")
pub fn bitwise_exclusive_or(x: Int, y: Int) -> Int

@external(erlang, "erlang", "bsl")
@external(javascript, "../gleam_stdlib.mjs", "bitwise_shift_left")
pub fn bitwise_shift_left(x: Int, y: Int) -> Int

@external(erlang, "erlang", "bsr")
@external(javascript, "../gleam_stdlib.mjs", "bitwise_shift_right")
pub fn bitwise_shift_right(x: Int, y: Int) -> Int`,
  'gleam/dynamic/decode': `
import gleam/bit_array
import gleam/dict.{type Dict}
import gleam/dynamic
import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}

pub type Dynamic =
  dynamic.Dynamic

pub type DecodeError {
  DecodeError(expected: String, found: String, path: List(String))
}

pub opaque type Decoder(t) {
  Decoder(function: fn(Dynamic) -> #(t, List(DecodeError)))
}

pub fn subfield(
  field_path: List(name),
  field_decoder: Decoder(t),
  next: fn(t) -> Decoder(final),
) -> Decoder(final) {
  Decoder(function: fn(data) {
    let #(out, errors1) =
      index(field_path, [], field_decoder.function, data, fn(data, position) {
        let #(default, _) = field_decoder.function(data)
        #(default, [DecodeError("Field", "Nothing", [])])
        |> push_path(list.reverse(position))
      })
    let #(out, errors2) = next(out).function(data)
    #(out, list.append(errors1, errors2))
  })
}

pub fn run(data: Dynamic, decoder: Decoder(t)) -> Result(t, List(DecodeError)) {
  let #(maybe_invalid_data, errors) = decoder.function(data)
  case errors {
    [] -> Ok(maybe_invalid_data)
    [_, ..] -> Error(errors)
  }
}

pub fn at(path: List(segment), inner: Decoder(a)) -> Decoder(a) {
  Decoder(function: fn(data) {
    index(path, [], inner.function, data, fn(data, position) {
      let #(default, _) = inner.function(data)
      #(default, [DecodeError("Field", "Nothing", [])])
      |> push_path(list.reverse(position))
    })
  })
}

fn index(
  path: List(a),
  position: List(a),
  inner: fn(Dynamic) -> #(b, List(DecodeError)),
  data: Dynamic,
  handle_miss: fn(Dynamic, List(a)) -> #(b, List(DecodeError)),
) -> #(b, List(DecodeError)) {
  case path {
    [] -> {
      data
      |> inner
      |> push_path(list.reverse(position))
    }

    [key, ..path] -> {
      case bare_index(data, key) {
        Ok(Some(data)) -> {
          index(path, [key, ..position], inner, data, handle_miss)
        }
        Ok(None) -> {
          handle_miss(data, [key, ..position])
        }
        Error(kind) -> {
          let #(default, _) = inner(data)
          #(default, [DecodeError(kind, dynamic.classify(data), [])])
          |> push_path(list.reverse(position))
        }
      }
    }
  }
}

@external(erlang, "gleam_stdlib", "index")
@external(javascript, "../../gleam_stdlib.mjs", "index")
fn bare_index(data: Dynamic, key: anything) -> Result(Option(Dynamic), String)

fn push_path(
  layer: #(t, List(DecodeError)),
  path: List(key),
) -> #(t, List(DecodeError)) {
  let decoder = one_of(string, [int |> map(int.to_string)])
  let path =
    list.map(path, fn(key) {
      let key = cast(key)
      case run(key, decoder) {
        Ok(key) -> key
        Error(_) -> "<" <> dynamic.classify(key) <> ">"
      }
    })
  let errors =
    list.map(layer.1, fn(error) {
      DecodeError(..error, path: list.append(path, error.path))
    })
  #(layer.0, errors)
}

pub fn success(data: t) -> Decoder(t) {
  Decoder(function: fn(_) { #(data, []) })
}

pub fn decode_error(
  expected expected: String,
  found found: Dynamic,
) -> List(DecodeError) {
  [DecodeError(expected: expected, found: dynamic.classify(found), path: [])]
}

pub fn field(
  field_name: name,
  field_decoder: Decoder(t),
  next: fn(t) -> Decoder(final),
) -> Decoder(final) {
  subfield([field_name], field_decoder, next)
}

pub fn optional_field(
  key: name,
  default: t,
  field_decoder: Decoder(t),
  next: fn(t) -> Decoder(final),
) -> Decoder(final) {
  Decoder(function: fn(data) {
    let #(out, errors1) =
      case bare_index(data, key) {
        Ok(Some(data)) -> field_decoder.function(data)
        Ok(None) -> #(default, [])
        Error(kind) -> #(default, [
          DecodeError(kind, dynamic.classify(data), []),
        ])
      }
      |> push_path([key])
    let #(out, errors2) = next(out).function(data)
    #(out, list.append(errors1, errors2))
  })
}

pub fn optionally_at(
  path: List(segment),
  default: a,
  inner: Decoder(a),
) -> Decoder(a) {
  Decoder(function: fn(data) {
    index(path, [], inner.function, data, fn(_, _) { #(default, []) })
  })
}

fn run_dynamic_function(
  data: Dynamic,
  name: String,
  f: fn(Dynamic) -> Result(t, t),
) -> #(t, List(DecodeError)) {
  case f(data) {
    Ok(data) -> #(data, [])
    Error(placeholder) -> #(placeholder, [
      DecodeError(name, dynamic.classify(data), []),
    ])
  }
}

pub const string: Decoder(String) = Decoder(decode_string)

fn decode_string(data: Dynamic) -> #(String, List(DecodeError)) {
  run_dynamic_function(data, "String", dynamic_string)
}

@external(javascript, "../../gleam_stdlib.mjs", "string")
fn dynamic_string(from data: Dynamic) -> Result(String, String) {
  case dynamic_bit_array(data) {
    Ok(data) ->
      case bit_array.to_string(data) {
        Ok(string) -> Ok(string)
        Error(_) -> Error("")
      }
    Error(_) -> Error("")
  }
}

pub const bool: Decoder(Bool) = Decoder(decode_bool)

fn decode_bool(data: Dynamic) -> #(Bool, List(DecodeError)) {
  case cast(True) == data {
    True -> #(True, [])
    False ->
      case cast(False) == data {
        True -> #(False, [])
        False -> #(False, decode_error("Bool", data))
      }
  }
}

pub const int: Decoder(Int) = Decoder(decode_int)

fn decode_int(data: Dynamic) -> #(Int, List(DecodeError)) {
  run_dynamic_function(data, "Int", dynamic_int)
}

@external(erlang, "gleam_stdlib", "int")
@external(javascript, "../../gleam_stdlib.mjs", "int")
fn dynamic_int(data: Dynamic) -> Result(Int, Int)

pub const float: Decoder(Float) = Decoder(decode_float)

fn decode_float(data: Dynamic) -> #(Float, List(DecodeError)) {
  run_dynamic_function(data, "Float", dynamic_float)
}

@external(erlang, "gleam_stdlib", "float")
@external(javascript, "../../gleam_stdlib.mjs", "float")
fn dynamic_float(data: Dynamic) -> Result(Float, Float)

pub const dynamic: Decoder(Dynamic) = Decoder(decode_dynamic)

fn decode_dynamic(data: Dynamic) -> #(Dynamic, List(DecodeError)) {
  #(data, [])
}

pub const bit_array: Decoder(BitArray) = Decoder(decode_bit_array)

fn decode_bit_array(data: Dynamic) -> #(BitArray, List(DecodeError)) {
  run_dynamic_function(data, "BitArray", dynamic_bit_array)
}

@external(erlang, "gleam_stdlib", "bit_array")
@external(javascript, "../../gleam_stdlib.mjs", "bit_array")
fn dynamic_bit_array(data: Dynamic) -> Result(BitArray, BitArray)

pub fn list(of inner: Decoder(a)) -> Decoder(List(a)) {
  Decoder(fn(data) {
    decode_list(data, inner.function, fn(p, k) { push_path(p, [k]) }, 0, [])
  })
}

@external(erlang, "gleam_stdlib", "list")
@external(javascript, "../../gleam_stdlib.mjs", "list")
fn decode_list(
  data: Dynamic,
  item: fn(Dynamic) -> #(t, List(DecodeError)),
  push_path: fn(#(t, List(DecodeError)), key) -> #(t, List(DecodeError)),
  index: Int,
  acc: List(t),
) -> #(List(t), List(DecodeError))

pub fn dict(
  key: Decoder(key),
  value: Decoder(value),
) -> Decoder(Dict(key, value)) {
  Decoder(fn(data) {
    case decode_dict(data) {
      Error(_) -> #(dict.new(), decode_error("Dict", data))
      Ok(dict) ->
        dict.fold(dict, #(dict.new(), []), fn(a, k, v) {
          case a.1 {
            [] -> fold_dict(a, k, v, key.function, value.function)
            [_, ..] -> a
          }
        })
    }
  })
}

fn fold_dict(
  acc: #(Dict(k, v), List(DecodeError)),
  key: Dynamic,
  value: Dynamic,
  key_decoder: fn(Dynamic) -> #(k, List(DecodeError)),
  value_decoder: fn(Dynamic) -> #(v, List(DecodeError)),
) -> #(Dict(k, v), List(DecodeError)) {
  case key_decoder(key) {
    #(key, []) ->
      case value_decoder(value) {
        #(value, []) -> {
          let dict = dict.insert(acc.0, key, value)
          #(dict, acc.1)
        }
        #(_, errors) -> push_path(#(dict.new(), errors), ["values"])
      }
    #(_, errors) -> push_path(#(dict.new(), errors), ["keys"])
  }
}

@external(erlang, "gleam_stdlib", "dict")
@external(javascript, "../../gleam_stdlib.mjs", "dict")
fn decode_dict(data: Dynamic) -> Result(Dict(Dynamic, Dynamic), Nil)

pub fn optional(inner: Decoder(a)) -> Decoder(Option(a)) {
  Decoder(function: fn(data) {
    case is_null(data) {
      True -> #(option.None, [])
      False -> {
        let #(data, errors) = inner.function(data)
        #(option.Some(data), errors)
      }
    }
  })
}

pub fn map(decoder: Decoder(a), transformer: fn(a) -> b) -> Decoder(b) {
  Decoder(function: fn(d) {
    let #(data, errors) = decoder.function(d)
    #(transformer(data), errors)
  })
}

pub fn map_errors(
  decoder: Decoder(a),
  transformer: fn(List(DecodeError)) -> List(DecodeError),
) -> Decoder(a) {
  Decoder(function: fn(d) {
    let #(data, errors) = decoder.function(d)
    #(data, transformer(errors))
  })
}

pub fn collapse_errors(decoder: Decoder(a), name: String) -> Decoder(a) {
  Decoder(function: fn(dynamic_data) {
    let #(data, errors) as layer = decoder.function(dynamic_data)
    case errors {
      [] -> layer
      [_, ..] -> #(data, decode_error(name, dynamic_data))
    }
  })
}

pub fn then(decoder: Decoder(a), next: fn(a) -> Decoder(b)) -> Decoder(b) {
  Decoder(function: fn(dynamic_data) {
    let #(data, errors) = decoder.function(dynamic_data)
    let decoder = next(data)
    let #(data, _) as layer = decoder.function(dynamic_data)
    case errors {
      [] -> layer
      [_, ..] -> #(data, errors)
    }
  })
}

pub fn one_of(
  first: Decoder(a),
  or alternatives: List(Decoder(a)),
) -> Decoder(a) {
  Decoder(function: fn(dynamic_data) {
    let #(_, errors) as layer = first.function(dynamic_data)
    case errors {
      [] -> layer
      [_, ..] -> run_decoders(dynamic_data, layer, alternatives)
    }
  })
}

fn run_decoders(
  data: Dynamic,
  failure: #(a, List(DecodeError)),
  decoders: List(Decoder(a)),
) -> #(a, List(DecodeError)) {
  case decoders {
    [] -> failure

    [decoder, ..decoders] -> {
      let #(_, errors) as layer = decoder.function(data)
      case errors {
        [] -> layer
        [_, ..] -> run_decoders(data, failure, decoders)
      }
    }
  }
}

pub fn failure(placeholder: a, expected name: String) -> Decoder(a) {
  Decoder(function: fn(d) { #(placeholder, decode_error(name, d)) })
}

pub fn new_primitive_decoder(
  name: String,
  decoding_function: fn(Dynamic) -> Result(t, t),
) -> Decoder(t) {
  Decoder(function: fn(d) {
    case decoding_function(d) {
      Ok(t) -> #(t, [])
      Error(placeholder) -> #(placeholder, [
        DecodeError(name, dynamic.classify(d), []),
      ])
    }
  })
}

pub fn recursive(inner: fn() -> Decoder(a)) -> Decoder(a) {
  Decoder(function: fn(data) {
    let decoder = inner()
    decoder.function(data)
  })
}

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../../gleam_stdlib.mjs", "identity")
fn cast(a: anything) -> Dynamic

@external(erlang, "gleam_stdlib", "is_null")
@external(javascript, "../../gleam_stdlib.mjs", "is_null")
fn is_null(a: Dynamic) -> Bool`,
  'gleam/string': `
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/order
import gleam/string_tree.{type StringTree}

pub fn is_empty(str: String) -> Bool {
  str == ""
}

@external(erlang, "string", "length")
@external(javascript, "../gleam_stdlib.mjs", "string_length")
pub fn length(string: String) -> Int

pub fn reverse(string: String) -> String {
  string
  |> string_tree.from_string
  |> string_tree.reverse
  |> string_tree.to_string
}

pub fn replace(
  in string: String,
  each pattern: String,
  with substitute: String,
) -> String {
  string
  |> string_tree.from_string
  |> string_tree.replace(each: pattern, with: substitute)
  |> string_tree.to_string
}

@external(erlang, "string", "lowercase")
@external(javascript, "../gleam_stdlib.mjs", "lowercase")
pub fn lowercase(string: String) -> String

@external(erlang, "string", "uppercase")
@external(javascript, "../gleam_stdlib.mjs", "uppercase")
pub fn uppercase(string: String) -> String

pub fn compare(a: String, b: String) -> order.Order {
  case a == b {
    True -> order.Eq
    _ ->
      case less_than(a, b) {
        True -> order.Lt
        False -> order.Gt
      }
  }
}

@external(erlang, "gleam_stdlib", "less_than")
@external(javascript, "../gleam_stdlib.mjs", "less_than")
fn less_than(a: String, b: String) -> Bool

pub fn slice(from string: String, at_index idx: Int, length len: Int) -> String {
  case len <= 0 {
    True -> ""
    False ->
      case idx < 0 {
        True -> {
          let translated_idx = length(string) + idx
          case translated_idx < 0 {
            True -> ""
            False -> grapheme_slice(string, translated_idx, len)
          }
        }
        False -> grapheme_slice(string, idx, len)
      }
  }
}

@external(erlang, "gleam_stdlib", "slice")
@external(javascript, "../gleam_stdlib.mjs", "string_grapheme_slice")
fn grapheme_slice(string: String, index: Int, length: Int) -> String

@external(erlang, "binary", "part")
@external(javascript, "../gleam_stdlib.mjs", "string_byte_slice")
fn unsafe_byte_slice(string: String, index: Int, length: Int) -> String

@external(erlang, "gleam_stdlib", "crop_string")
@external(javascript, "../gleam_stdlib.mjs", "crop_string")
pub fn crop(from string: String, before substring: String) -> String

pub fn drop_start(from string: String, up_to num_graphemes: Int) -> String {
  case num_graphemes <= 0 {
    True -> string
    False -> {
      let prefix = grapheme_slice(string, 0, num_graphemes)
      let prefix_size = byte_size(prefix)
      unsafe_byte_slice(string, prefix_size, byte_size(string) - prefix_size)
    }
  }
}

pub fn drop_end(from string: String, up_to num_graphemes: Int) -> String {
  case num_graphemes <= 0 {
    True -> string
    False -> slice(string, 0, length(string) - num_graphemes)
  }
}

@external(erlang, "gleam_stdlib", "contains_string")
@external(javascript, "../gleam_stdlib.mjs", "contains_string")
pub fn contains(does haystack: String, contain needle: String) -> Bool

@external(erlang, "gleam_stdlib", "string_starts_with")
@external(javascript, "../gleam_stdlib.mjs", "starts_with")
pub fn starts_with(string: String, prefix: String) -> Bool

@external(erlang, "gleam_stdlib", "string_ends_with")
@external(javascript, "../gleam_stdlib.mjs", "ends_with")
pub fn ends_with(string: String, suffix: String) -> Bool

pub fn split(x: String, on substring: String) -> List(String) {
  case substring {
    "" -> to_graphemes(x)
    _ ->
      x
      |> string_tree.from_string
      |> string_tree.split(on: substring)
      |> list.map(with: string_tree.to_string)
  }
}

@external(javascript, "../gleam_stdlib.mjs", "split_once")
pub fn split_once(
  string: String,
  on substring: String,
) -> Result(#(String, String), Nil) {
  case erl_split(string, substring) {
    [first, rest] -> Ok(#(first, rest))
    _ -> Error(Nil)
  }
}

@external(erlang, "string", "split")
fn erl_split(a: String, b: String) -> List(String)

pub fn append(to first: String, suffix second: String) -> String {
  first <> second
}

@external(erlang, "erlang", "list_to_binary")
pub fn concat(strings: List(String)) -> String {
  concat_loop(strings, "")
}

fn concat_loop(strings: List(String), accumulator: String) -> String {
  case strings {
    [string, ..strings] -> concat_loop(strings, accumulator <> string)
    [] -> accumulator
  }
}

pub fn repeat(string: String, times times: Int) -> String {
  case times <= 0 {
    True -> ""
    False -> repeat_loop(times, string, "")
  }
}

fn repeat_loop(times: Int, doubling_acc: String, acc: String) -> String {
  let acc = case times % 2 {
    0 -> acc
    _ -> acc <> doubling_acc
  }
  let times = times / 2
  case times <= 0 {
    True -> acc
    False -> repeat_loop(times, doubling_acc <> doubling_acc, acc)
  }
}

pub fn join(strings: List(String), with separator: String) -> String {
  case strings {
    [] -> ""
    [first, ..rest] -> join_loop(rest, separator, first)
  }
}

fn join_loop(
  strings: List(String),
  separator: String,
  accumulator: String,
) -> String {
  case strings {
    [] -> accumulator
    [string, ..strings] ->
      join_loop(strings, separator, accumulator <> separator <> string)
  }
}

pub fn pad_start(
  string: String,
  to desired_length: Int,
  with pad_string: String,
) -> String {
  let current_length = length(string)
  let to_pad_length = desired_length - current_length

  case to_pad_length <= 0 {
    True -> string
    False -> padding(to_pad_length, pad_string) <> string
  }
}

pub fn pad_end(
  string: String,
  to desired_length: Int,
  with pad_string: String,
) -> String {
  let current_length = length(string)
  let to_pad_length = desired_length - current_length

  case to_pad_length <= 0 {
    True -> string
    False -> string <> padding(to_pad_length, pad_string)
  }
}

fn padding(size: Int, pad_string: String) -> String {
  let pad_string_length = length(pad_string)
  let num_pads = size / pad_string_length
  let extra = size % pad_string_length

  repeat(pad_string, num_pads) <> slice(pad_string, 0, extra)
}

pub fn trim(string: String) -> String {
  string |> trim_start |> trim_end
}

@external(erlang, "string", "trim")
fn erl_trim(a: String, b: Direction) -> String

type Direction {
  Leading
  Trailing
}

@external(javascript, "../gleam_stdlib.mjs", "trim_start")
pub fn trim_start(string: String) -> String {
  erl_trim(string, Leading)
}

@external(javascript, "../gleam_stdlib.mjs", "trim_end")
pub fn trim_end(string: String) -> String {
  erl_trim(string, Trailing)
}

@external(erlang, "gleam_stdlib", "string_pop_grapheme")
@external(javascript, "../gleam_stdlib.mjs", "pop_grapheme")
pub fn pop_grapheme(string: String) -> Result(#(String, String), Nil)

@external(javascript, "../gleam_stdlib.mjs", "graphemes")
pub fn to_graphemes(string: String) -> List(String) {
  string
  |> to_graphemes_loop([])
  |> list.reverse
}

fn to_graphemes_loop(string: String, acc: List(String)) -> List(String) {
  case pop_grapheme(string) {
    Ok(#(grapheme, rest)) -> to_graphemes_loop(rest, [grapheme, ..acc])
    Error(_) -> acc
  }
}

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "codepoint")
fn unsafe_int_to_utf_codepoint(a: Int) -> UtfCodepoint

pub fn to_utf_codepoints(string: String) -> List(UtfCodepoint) {
  do_to_utf_codepoints(string)
}

@target(erlang)
fn do_to_utf_codepoints(string: String) -> List(UtfCodepoint) {
  to_utf_codepoints_loop(<<string:utf8>>, [])
}

@target(erlang)
fn to_utf_codepoints_loop(
  bit_array: BitArray,
  acc: List(UtfCodepoint),
) -> List(UtfCodepoint) {
  case bit_array {
    <<first:utf8_codepoint, rest:bytes>> ->
      to_utf_codepoints_loop(rest, [first, ..acc])
    _ -> list.reverse(acc)
  }
}

@target(javascript)
fn do_to_utf_codepoints(string: String) -> List(UtfCodepoint) {
  string
  |> string_to_codepoint_integer_list
  |> list.map(unsafe_int_to_utf_codepoint)
}

@target(javascript)
@external(javascript, "../gleam_stdlib.mjs", "string_to_codepoint_integer_list")
fn string_to_codepoint_integer_list(string: String) -> List(Int)

@external(erlang, "gleam_stdlib", "utf_codepoint_list_to_string")
@external(javascript, "../gleam_stdlib.mjs", "utf_codepoint_list_to_string")
pub fn from_utf_codepoints(utf_codepoints: List(UtfCodepoint)) -> String

pub fn utf_codepoint(value: Int) -> Result(UtfCodepoint, Nil) {
  case value {
    i if i > 1_114_111 -> Error(Nil)
    i if i >= 55_296 && i <= 57_343 -> Error(Nil)
    i if i < 0 -> Error(Nil)
    i -> Ok(unsafe_int_to_utf_codepoint(i))
  }
}

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "utf_codepoint_to_int")
pub fn utf_codepoint_to_int(cp: UtfCodepoint) -> Int

pub fn to_option(string: String) -> Option(String) {
  case string {
    "" -> None
    _ -> Some(string)
  }
}

pub fn first(string: String) -> Result(String, Nil) {
  case pop_grapheme(string) {
    Ok(#(first, _)) -> Ok(first)
    Error(e) -> Error(e)
  }
}

pub fn last(string: String) -> Result(String, Nil) {
  case pop_grapheme(string) {
    Ok(#(first, "")) -> Ok(first)
    Ok(#(_, rest)) -> Ok(slice(rest, -1, 1))
    Error(e) -> Error(e)
  }
}

pub fn capitalise(string: String) -> String {
  case pop_grapheme(string) {
    Ok(#(first, rest)) -> append(to: uppercase(first), suffix: lowercase(rest))
    Error(_) -> ""
  }
}

pub fn inspect(term: anything) -> String {
  term
  |> do_inspect
  |> string_tree.to_string
}

@external(erlang, "gleam_stdlib", "inspect")
@external(javascript, "../gleam_stdlib.mjs", "inspect")
fn do_inspect(term: anything) -> StringTree

@external(erlang, "erlang", "byte_size")
@external(javascript, "../gleam_stdlib.mjs", "byte_size")
pub fn byte_size(string: String) -> Int`,
  'gleam/function': `pub fn identity(x: a) -> a {
  x
}`,
  'gleam/bool': `
pub fn and(a: Bool, b: Bool) -> Bool {
  a && b
}

pub fn or(a: Bool, b: Bool) -> Bool {
  a || b
}

pub fn negate(bool: Bool) -> Bool {
  !bool
}

pub fn nor(a: Bool, b: Bool) -> Bool {
  !{ a || b }
}

pub fn nand(a: Bool, b: Bool) -> Bool {
  !{ a && b }
}

pub fn exclusive_or(a: Bool, b: Bool) -> Bool {
  a != b
}

pub fn exclusive_nor(a: Bool, b: Bool) -> Bool {
  a == b
}

pub fn to_string(bool: Bool) -> String {
  case bool {
    False -> "False"
    True -> "True"
  }
}

pub fn guard(
  when requirement: Bool,
  return consequence: a,
  otherwise alternative: fn() -> a,
) -> a {
  case requirement {
    True -> consequence
    False -> alternative()
  }
}

pub fn lazy_guard(
  when requirement: Bool,
  return consequence: fn() -> a,
  otherwise alternative: fn() -> a,
) -> a {
  case requirement {
    True -> consequence()
    False -> alternative()
  }
}`,
  'gleam/uri': `
import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/string_tree.{type StringTree}

pub type Uri {
  Uri(
    scheme: Option(String),
    userinfo: Option(String),
    host: Option(String),
    port: Option(Int),
    path: String,
    query: Option(String),
    fragment: Option(String),
  )
}

pub const empty = Uri(
  scheme: None,
  userinfo: None,
  host: None,
  port: None,
  path: "",
  query: None,
  fragment: None,
)

@external(erlang, "gleam_stdlib", "uri_parse")
pub fn parse(uri_string: String) -> Result(Uri, Nil) {
  parse_scheme_loop(uri_string, uri_string, empty, 0)
}

fn parse_scheme_loop(
  original: String,
  uri_string: String,
  pieces: Uri,
  size: Int,
) -> Result(Uri, Nil) {
  case uri_string {
    "/" <> _ if size == 0 -> parse_authority_with_slashes(uri_string, pieces)
    "/" <> _ -> {
      let scheme = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, scheme: Some(string.lowercase(scheme)))
      parse_authority_with_slashes(uri_string, pieces)
    }

    "?" <> rest if size == 0 -> parse_query_with_question_mark(rest, pieces)
    "?" <> rest -> {
      let scheme = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, scheme: Some(string.lowercase(scheme)))
      parse_query_with_question_mark(rest, pieces)
    }

    "#" <> rest if size == 0 -> parse_fragment(rest, pieces)
    "#" <> rest -> {
      let scheme = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, scheme: Some(string.lowercase(scheme)))
      parse_fragment(rest, pieces)
    }

    ":" <> _ if size == 0 -> Error(Nil)
    ":" <> rest -> {
      let scheme = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, scheme: Some(string.lowercase(scheme)))
      parse_authority_with_slashes(rest, pieces)
    }

    "" -> Ok(Uri(..pieces, path: original))

    _ -> {
      let #(_, rest) = pop_codeunit(uri_string)
      parse_scheme_loop(original, rest, pieces, size + 1)
    }
  }
}

fn parse_authority_with_slashes(
  uri_string: String,
  pieces: Uri,
) -> Result(Uri, Nil) {
  case uri_string {
    "//" -> Ok(Uri(..pieces, host: Some("")))
    "//" <> rest -> parse_authority_pieces(rest, pieces)
    _ -> parse_path(uri_string, pieces)
  }
}

fn parse_authority_pieces(string: String, pieces: Uri) -> Result(Uri, Nil) {
  parse_userinfo_loop(string, string, pieces, 0)
}

fn parse_userinfo_loop(
  original: String,
  uri_string: String,
  pieces: Uri,
  size: Int,
) -> Result(Uri, Nil) {
  case uri_string {
    "@" <> rest if size == 0 -> parse_host(rest, pieces)
    "@" <> rest -> {
      let userinfo = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, userinfo: Some(userinfo))
      parse_host(rest, pieces)
    }

    "" | "/" <> _ | "?" <> _ | "#" <> _ -> parse_host(original, pieces)

    _ -> {
      let #(_, rest) = pop_codeunit(uri_string)
      parse_userinfo_loop(original, rest, pieces, size + 1)
    }
  }
}

fn parse_host(uri_string: String, pieces: Uri) -> Result(Uri, Nil) {
  case uri_string {
    "[" <> _ -> parse_host_within_brackets(uri_string, pieces)

    ":" <> _ -> {
      let pieces = Uri(..pieces, host: Some(""))
      parse_port(uri_string, pieces)
    }

    "" -> Ok(Uri(..pieces, host: Some("")))

    _ -> parse_host_outside_of_brackets(uri_string, pieces)
  }
}

fn parse_host_within_brackets(
  uri_string: String,
  pieces: Uri,
) -> Result(Uri, Nil) {
  parse_host_within_brackets_loop(uri_string, uri_string, pieces, 0)
}

fn parse_host_within_brackets_loop(
  original: String,
  uri_string: String,
  pieces: Uri,
  size: Int,
) -> Result(Uri, Nil) {
  case uri_string {
    "" -> Ok(Uri(..pieces, host: Some(uri_string)))

    "]" <> rest if size == 0 -> parse_port(rest, pieces)
    "]" <> rest -> {
      let host = codeunit_slice(original, at_index: 0, length: size + 1)
      let pieces = Uri(..pieces, host: Some(host))
      parse_port(rest, pieces)
    }

    "/" <> _ if size == 0 -> parse_path(uri_string, pieces)
    "/" <> _ -> {
      let host = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, host: Some(host))
      parse_path(uri_string, pieces)
    }

    "?" <> rest if size == 0 -> parse_query_with_question_mark(rest, pieces)
    "?" <> rest -> {
      let host = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, host: Some(host))
      parse_query_with_question_mark(rest, pieces)
    }

    "#" <> rest if size == 0 -> parse_fragment(rest, pieces)
    "#" <> rest -> {
      let host = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, host: Some(host))
      parse_fragment(rest, pieces)
    }

    _ -> {
      let #(char, rest) = pop_codeunit(uri_string)
      case is_valid_host_within_brackets_char(char) {
        True ->
          parse_host_within_brackets_loop(original, rest, pieces, size + 1)

        False ->
          parse_host_outside_of_brackets_loop(original, original, pieces, 0)
      }
    }
  }
}

fn is_valid_host_within_brackets_char(char: Int) -> Bool {
  { 48 >= char && char <= 57 }
  || { 65 >= char && char <= 90 }
  || { 97 >= char && char <= 122 }
  || char == 58
  || char == 46
}

fn parse_host_outside_of_brackets(
  uri_string: String,
  pieces: Uri,
) -> Result(Uri, Nil) {
  parse_host_outside_of_brackets_loop(uri_string, uri_string, pieces, 0)
}

fn parse_host_outside_of_brackets_loop(
  original: String,
  uri_string: String,
  pieces: Uri,
  size: Int,
) -> Result(Uri, Nil) {
  case uri_string {
    "" -> Ok(Uri(..pieces, host: Some(original)))

    ":" <> _ -> {
      let host = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, host: Some(host))
      parse_port(uri_string, pieces)
    }

    "/" <> _ -> {
      let host = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, host: Some(host))
      parse_path(uri_string, pieces)
    }

    "?" <> rest -> {
      let host = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, host: Some(host))
      parse_query_with_question_mark(rest, pieces)
    }

    "#" <> rest -> {
      let host = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, host: Some(host))
      parse_fragment(rest, pieces)
    }

    _ -> {
      let #(_, rest) = pop_codeunit(uri_string)
      parse_host_outside_of_brackets_loop(original, rest, pieces, size + 1)
    }
  }
}

fn parse_port(uri_string: String, pieces: Uri) -> Result(Uri, Nil) {
  case uri_string {
    ":0" <> rest -> parse_port_loop(rest, pieces, 0)
    ":1" <> rest -> parse_port_loop(rest, pieces, 1)
    ":2" <> rest -> parse_port_loop(rest, pieces, 2)
    ":3" <> rest -> parse_port_loop(rest, pieces, 3)
    ":4" <> rest -> parse_port_loop(rest, pieces, 4)
    ":5" <> rest -> parse_port_loop(rest, pieces, 5)
    ":6" <> rest -> parse_port_loop(rest, pieces, 6)
    ":7" <> rest -> parse_port_loop(rest, pieces, 7)
    ":8" <> rest -> parse_port_loop(rest, pieces, 8)
    ":9" <> rest -> parse_port_loop(rest, pieces, 9)

    ":" | "" -> Ok(pieces)

    "?" <> rest | ":?" <> rest -> parse_query_with_question_mark(rest, pieces)

    "#" <> rest | ":#" <> rest -> parse_fragment(rest, pieces)

    "/" <> _ -> parse_path(uri_string, pieces)
    ":" <> rest ->
      case rest {
        "/" <> _ -> parse_path(rest, pieces)
        _ -> Error(Nil)
      }

    _ -> Error(Nil)
  }
}

fn parse_port_loop(
  uri_string: String,
  pieces: Uri,
  port: Int,
) -> Result(Uri, Nil) {
  case uri_string {
    "0" <> rest -> parse_port_loop(rest, pieces, port * 10)
    "1" <> rest -> parse_port_loop(rest, pieces, port * 10 + 1)
    "2" <> rest -> parse_port_loop(rest, pieces, port * 10 + 2)
    "3" <> rest -> parse_port_loop(rest, pieces, port * 10 + 3)
    "4" <> rest -> parse_port_loop(rest, pieces, port * 10 + 4)
    "5" <> rest -> parse_port_loop(rest, pieces, port * 10 + 5)
    "6" <> rest -> parse_port_loop(rest, pieces, port * 10 + 6)
    "7" <> rest -> parse_port_loop(rest, pieces, port * 10 + 7)
    "8" <> rest -> parse_port_loop(rest, pieces, port * 10 + 8)
    "9" <> rest -> parse_port_loop(rest, pieces, port * 10 + 9)

    "?" <> rest -> {
      let pieces = Uri(..pieces, port: Some(port))
      parse_query_with_question_mark(rest, pieces)
    }

    "#" <> rest -> {
      let pieces = Uri(..pieces, port: Some(port))
      parse_fragment(rest, pieces)
    }

    "/" <> _ -> {
      let pieces = Uri(..pieces, port: Some(port))
      parse_path(uri_string, pieces)
    }

    "" -> Ok(Uri(..pieces, port: Some(port)))

    _ -> Error(Nil)
  }
}

fn parse_path(uri_string: String, pieces: Uri) -> Result(Uri, Nil) {
  parse_path_loop(uri_string, uri_string, pieces, 0)
}

fn parse_path_loop(
  original: String,
  uri_string: String,
  pieces: Uri,
  size: Int,
) -> Result(Uri, Nil) {
  case uri_string {
    "?" <> rest -> {
      let path = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, path: path)
      parse_query_with_question_mark(rest, pieces)
    }

    "#" <> rest -> {
      let path = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, path: path)
      parse_fragment(rest, pieces)
    }

    "" -> Ok(Uri(..pieces, path: original))

    _ -> {
      let #(_, rest) = pop_codeunit(uri_string)
      parse_path_loop(original, rest, pieces, size + 1)
    }
  }
}

fn parse_query_with_question_mark(
  uri_string: String,
  pieces: Uri,
) -> Result(Uri, Nil) {
  parse_query_with_question_mark_loop(uri_string, uri_string, pieces, 0)
}

fn parse_query_with_question_mark_loop(
  original: String,
  uri_string: String,
  pieces: Uri,
  size: Int,
) -> Result(Uri, Nil) {
  case uri_string {
    "#" <> rest if size == 0 -> parse_fragment(rest, pieces)
    "#" <> rest -> {
      let query = codeunit_slice(original, at_index: 0, length: size)
      let pieces = Uri(..pieces, query: Some(query))
      parse_fragment(rest, pieces)
    }

    "" -> Ok(Uri(..pieces, query: Some(original)))

    _ -> {
      let #(_, rest) = pop_codeunit(uri_string)
      parse_query_with_question_mark_loop(original, rest, pieces, size + 1)
    }
  }
}

fn parse_fragment(rest: String, pieces: Uri) -> Result(Uri, Nil) {
  Ok(Uri(..pieces, fragment: Some(rest)))
}

@external(erlang, "gleam_stdlib", "string_pop_codeunit")
@external(javascript, "../gleam_stdlib.mjs", "pop_codeunit")
fn pop_codeunit(str: String) -> #(Int, String)

@external(erlang, "binary", "part")
@external(javascript, "../gleam_stdlib.mjs", "string_codeunit_slice")
fn codeunit_slice(str: String, at_index from: Int, length length: Int) -> String

@external(erlang, "gleam_stdlib", "parse_query")
@external(javascript, "../gleam_stdlib.mjs", "parse_query")
pub fn parse_query(query: String) -> Result(List(#(String, String)), Nil)

pub fn query_to_string(query: List(#(String, String))) -> String {
  query
  |> list.map(query_pair)
  |> list.intersperse(string_tree.from_string("&"))
  |> string_tree.concat
  |> string_tree.to_string
}

fn query_pair(pair: #(String, String)) -> StringTree {
  [percent_encode_query(pair.0), "=", percent_encode_query(pair.1)]
  |> string_tree.from_strings
}

fn percent_encode_query(part: String) -> String {
  percent_encode(part)
  |> string.replace(each: "+", with: "%2B")
}

@external(erlang, "gleam_stdlib", "percent_encode")
@external(javascript, "../gleam_stdlib.mjs", "percent_encode")
pub fn percent_encode(value: String) -> String

@external(erlang, "gleam_stdlib", "percent_decode")
@external(javascript, "../gleam_stdlib.mjs", "percent_decode")
pub fn percent_decode(value: String) -> Result(String, Nil)

pub fn path_segments(path: String) -> List(String) {
  remove_dot_segments(string.split(path, "/"))
}

fn remove_dot_segments(input: List(String)) -> List(String) {
  remove_dot_segments_loop(input, [])
}

fn remove_dot_segments_loop(
  input: List(String),
  accumulator: List(String),
) -> List(String) {
  case input {
    [] -> list.reverse(accumulator)
    [segment, ..rest] -> {
      let accumulator = case segment, accumulator {
        "", accumulator -> accumulator
        ".", accumulator -> accumulator
        "..", [] -> []
        "..", [_, ..accumulator] -> accumulator
        segment, accumulator -> [segment, ..accumulator]
      }
      remove_dot_segments_loop(rest, accumulator)
    }
  }
}

pub fn to_string(uri: Uri) -> String {
  let parts = case uri.fragment {
    Some(fragment) -> ["#", fragment]
    None -> []
  }
  let parts = case uri.query {
    Some(query) -> ["?", query, ..parts]
    None -> parts
  }
  let parts = [uri.path, ..parts]
  let parts = case uri.host, string.starts_with(uri.path, "/") {
    Some(host), False if host != "" -> ["/", ..parts]
    _, _ -> parts
  }
  let parts = case uri.host, uri.port {
    Some(_), Some(port) -> [":", int.to_string(port), ..parts]
    _, _ -> parts
  }
  let parts = case uri.scheme, uri.userinfo, uri.host {
    Some(s), Some(u), Some(h) -> [s, "://", u, "@", h, ..parts]
    Some(s), None, Some(h) -> [s, "://", h, ..parts]
    Some(s), Some(_), None | Some(s), None, None -> [s, ":", ..parts]
    None, None, Some(h) -> ["//", h, ..parts]
    _, _, _ -> parts
  }
  string.concat(parts)
}

pub fn origin(uri: Uri) -> Result(String, Nil) {
  let Uri(scheme: scheme, host: host, port: port, ..) = uri
  case host, scheme {
    Some(h), Some("https") if port == Some(443) ->
      Ok(string.concat(["https://", h]))
    Some(h), Some("http") if port == Some(80) ->
      Ok(string.concat(["http://", h]))
    Some(h), Some(s) if s == "http" || s == "https" -> {
      case port {
        Some(p) -> Ok(string.concat([s, "://", h, ":", int.to_string(p)]))
        None -> Ok(string.concat([s, "://", h]))
      }
    }
    _, _ -> Error(Nil)
  }
}

pub fn merge(base: Uri, relative: Uri) -> Result(Uri, Nil) {
  case base {
    Uri(scheme: Some(_), host: Some(_), ..) ->
      case relative {
        Uri(host: Some(_), ..) -> {
          let path =
            relative.path
            |> string.split("/")
            |> remove_dot_segments()
            |> join_segments()
          let resolved =
            Uri(
              option.or(relative.scheme, base.scheme),
              None,
              relative.host,
              option.or(relative.port, base.port),
              path,
              relative.query,
              relative.fragment,
            )
          Ok(resolved)
        }
        _ -> {
          let #(new_path, new_query) = case relative.path {
            "" -> #(base.path, option.or(relative.query, base.query))
            _ -> {
              let path_segments = case string.starts_with(relative.path, "/") {
                True -> string.split(relative.path, "/")
                False ->
                  base.path
                  |> string.split("/")
                  |> drop_last()
                  |> list.append(string.split(relative.path, "/"))
              }
              let path =
                path_segments
                |> remove_dot_segments()
                |> join_segments()
              #(path, relative.query)
            }
          }
          let resolved =
            Uri(
              base.scheme,
              None,
              base.host,
              base.port,
              new_path,
              new_query,
              relative.fragment,
            )
          Ok(resolved)
        }
      }
    _ -> Error(Nil)
  }
}

fn drop_last(elements: List(a)) -> List(a) {
  list.take(from: elements, up_to: list.length(elements) - 1)
}

fn join_segments(segments: List(String)) -> String {
  string.join(["", ..segments], "/")
}`,
  'gleam/float': `
import gleam/order.{type Order}

@external(erlang, "gleam_stdlib", "parse_float")
@external(javascript, "../gleam_stdlib.mjs", "parse_float")
pub fn parse(string: String) -> Result(Float, Nil)

@external(erlang, "gleam_stdlib", "float_to_string")
@external(javascript, "../gleam_stdlib.mjs", "float_to_string")
pub fn to_string(x: Float) -> String

pub fn clamp(x: Float, min min_bound: Float, max max_bound: Float) -> Float {
  case min_bound >=. max_bound {
    True -> x |> min(min_bound) |> max(max_bound)
    False -> x |> min(max_bound) |> max(min_bound)
  }
}

pub fn compare(a: Float, with b: Float) -> Order {
  case a == b {
    True -> order.Eq
    False ->
      case a <. b {
        True -> order.Lt
        False -> order.Gt
      }
  }
}

pub fn loosely_compare(
  a: Float,
  with b: Float,
  tolerating tolerance: Float,
) -> Order {
  let difference = absolute_value(a -. b)
  case difference <=. tolerance {
    True -> order.Eq
    False -> compare(a, b)
  }
}

pub fn loosely_equals(
  a: Float,
  with b: Float,
  tolerating tolerance: Float,
) -> Bool {
  let difference = absolute_value(a -. b)
  difference <=. tolerance
}

pub fn min(a: Float, b: Float) -> Float {
  case a <. b {
    True -> a
    False -> b
  }
}

pub fn max(a: Float, b: Float) -> Float {
  case a >. b {
    True -> a
    False -> b
  }
}

@external(erlang, "math", "ceil")
@external(javascript, "../gleam_stdlib.mjs", "ceiling")
pub fn ceiling(x: Float) -> Float

@external(erlang, "math", "floor")
@external(javascript, "../gleam_stdlib.mjs", "floor")
pub fn floor(x: Float) -> Float

@external(erlang, "erlang", "round")
pub fn round(x: Float) -> Int {
  case x >=. 0.0 {
    True -> js_round(x)
    False -> 0 - js_round(negate(x))
  }
}

@external(javascript, "../gleam_stdlib.mjs", "round")
fn js_round(a: Float) -> Int

@external(erlang, "erlang", "trunc")
@external(javascript, "../gleam_stdlib.mjs", "truncate")
pub fn truncate(x: Float) -> Int

pub fn to_precision(x: Float, precision: Int) -> Float {
  case precision <= 0 {
    True -> {
      let factor = do_power(10.0, do_to_float(-precision))
      do_to_float(round(x /. factor)) *. factor
    }
    False -> {
      let factor = do_power(10.0, do_to_float(precision))
      do_to_float(round(x *. factor)) /. factor
    }
  }
}

@external(erlang, "erlang", "float")
@external(javascript, "../gleam_stdlib.mjs", "identity")
fn do_to_float(a: Int) -> Float

pub fn absolute_value(x: Float) -> Float {
  case x >=. 0.0 {
    True -> x
    False -> 0.0 -. x
  }
}

pub fn power(base: Float, of exponent: Float) -> Result(Float, Nil) {
  let fractional: Bool = ceiling(exponent) -. exponent >. 0.0
  case base <. 0.0 && fractional || base == 0.0 && exponent <. 0.0 {
    True -> Error(Nil)
    False -> Ok(do_power(base, exponent))
  }
}

@external(erlang, "math", "pow")
@external(javascript, "../gleam_stdlib.mjs", "power")
fn do_power(a: Float, b: Float) -> Float

pub fn square_root(x: Float) -> Result(Float, Nil) {
  power(x, 0.5)
}

pub fn negate(x: Float) -> Float {
  -1.0 *. x
}

pub fn sum(numbers: List(Float)) -> Float {
  sum_loop(numbers, 0.0)
}

fn sum_loop(numbers: List(Float), initial: Float) -> Float {
  case numbers {
    [first, ..rest] -> sum_loop(rest, first +. initial)
    [] -> initial
  }
}

pub fn product(numbers: List(Float)) -> Float {
  product_loop(numbers, 1.0)
}

fn product_loop(numbers: List(Float), initial: Float) -> Float {
  case numbers {
    [first, ..rest] -> product_loop(rest, first *. initial)
    [] -> initial
  }
}

@external(erlang, "rand", "uniform")
@external(javascript, "../gleam_stdlib.mjs", "random_uniform")
pub fn random() -> Float

pub fn modulo(dividend: Float, by divisor: Float) -> Result(Float, Nil) {
  case divisor {
    0.0 -> Error(Nil)
    _ -> Ok(dividend -. floor(dividend /. divisor) *. divisor)
  }
}

pub fn divide(a: Float, by b: Float) -> Result(Float, Nil) {
  case b {
    0.0 -> Error(Nil)
    b -> Ok(a /. b)
  }
}

pub fn add(a: Float, b: Float) -> Float {
  a +. b
}

pub fn multiply(a: Float, b: Float) -> Float {
  a *. b
}

pub fn subtract(a: Float, b: Float) -> Float {
  a -. b
}

pub fn logarithm(x: Float) -> Result(Float, Nil) {
  case x <=. 0.0 {
    True -> Error(Nil)
    False -> Ok(do_log(x))
  }
}

@external(erlang, "math", "log")
@external(javascript, "../gleam_stdlib.mjs", "log")
fn do_log(x: Float) -> Float

@external(erlang, "math", "exp")
@external(javascript, "../gleam_stdlib.mjs", "exp")
pub fn exponential(x: Float) -> Float`,
  'gleam/set': `import gleam/dict.{type Dict}
import gleam/list
import gleam/result

@target(erlang)
type Token =
  List(Nil)

@target(erlang)
const token = []

@target(javascript)
type Token =
  Nil

@target(javascript)
const token = Nil

pub opaque type Set(member) {
  Set(dict: Dict(member, Token))
}

pub fn new() -> Set(member) {
  Set(dict.new())
}

pub fn size(set: Set(member)) -> Int {
  dict.size(set.dict)
}

pub fn is_empty(set: Set(member)) -> Bool {
  set == new()
}

pub fn insert(into set: Set(member), this member: member) -> Set(member) {
  Set(dict: dict.insert(set.dict, member, token))
}

pub fn contains(in set: Set(member), this member: member) -> Bool {
  set.dict
  |> dict.get(member)
  |> result.is_ok
}

pub fn delete(from set: Set(member), this member: member) -> Set(member) {
  Set(dict: dict.delete(set.dict, member))
}

pub fn to_list(set: Set(member)) -> List(member) {
  dict.keys(set.dict)
}

pub fn from_list(members: List(member)) -> Set(member) {
  let dict =
    list.fold(over: members, from: dict.new(), with: fn(m, k) {
      dict.insert(m, k, token)
    })
  Set(dict)
}

pub fn fold(
  over set: Set(member),
  from initial: acc,
  with reducer: fn(acc, member) -> acc,
) -> acc {
  dict.fold(over: set.dict, from: initial, with: fn(a, k, _) { reducer(a, k) })
}

pub fn filter(
  in set: Set(member),
  keeping predicate: fn(member) -> Bool,
) -> Set(member) {
  Set(dict.filter(in: set.dict, keeping: fn(m, _) { predicate(m) }))
}

pub fn map(set: Set(member), with fun: fn(member) -> mapped) -> Set(mapped) {
  fold(over: set, from: new(), with: fn(acc, member) {
    insert(acc, fun(member))
  })
}

pub fn drop(from set: Set(member), drop disallowed: List(member)) -> Set(member) {
  list.fold(over: disallowed, from: set, with: delete)
}

pub fn take(from set: Set(member), keeping desired: List(member)) -> Set(member) {
  Set(dict.take(from: set.dict, keeping: desired))
}

pub fn union(of first: Set(member), and second: Set(member)) -> Set(member) {
  let #(larger, smaller) = order(first, second)
  fold(over: smaller, from: larger, with: insert)
}

fn order(first: Set(member), second: Set(member)) -> #(Set(member), Set(member)) {
  case dict.size(first.dict) > dict.size(second.dict) {
    True -> #(first, second)
    False -> #(second, first)
  }
}

pub fn intersection(
  of first: Set(member),
  and second: Set(member),
) -> Set(member) {
  let #(larger, smaller) = order(first, second)
  take(from: larger, keeping: to_list(smaller))
}

pub fn difference(
  from first: Set(member),
  minus second: Set(member),
) -> Set(member) {
  drop(from: first, drop: to_list(second))
}

pub fn is_subset(first: Set(member), of second: Set(member)) -> Bool {
  intersection(of: first, and: second) == first
}

pub fn is_disjoint(first: Set(member), from second: Set(member)) -> Bool {
  intersection(of: first, and: second) == new()
}

pub fn symmetric_difference(
  of first: Set(member),
  and second: Set(member),
) -> Set(member) {
  difference(
    from: union(of: first, and: second),
    minus: intersection(of: first, and: second),
  )
}

pub fn each(set: Set(member), fun: fn(member) -> a) -> Nil {
  fold(set, Nil, fn(nil, member) {
    fun(member)
    nil
  })
}`,
  'gleam/bit_array': `
import gleam/int
import gleam/order
import gleam/string

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "bit_array_from_string")
pub fn from_string(x: String) -> BitArray

@external(erlang, "erlang", "bit_size")
@external(javascript, "../gleam_stdlib.mjs", "bit_array_bit_size")
pub fn bit_size(x: BitArray) -> Int

@external(erlang, "erlang", "byte_size")
@external(javascript, "../gleam_stdlib.mjs", "bit_array_byte_size")
pub fn byte_size(x: BitArray) -> Int

@external(erlang, "gleam_stdlib", "bit_array_pad_to_bytes")
@external(javascript, "../gleam_stdlib.mjs", "bit_array_pad_to_bytes")
pub fn pad_to_bytes(x: BitArray) -> BitArray

pub fn append(to first: BitArray, suffix second: BitArray) -> BitArray {
  concat([first, second])
}

@external(erlang, "gleam_stdlib", "bit_array_slice")
@external(javascript, "../gleam_stdlib.mjs", "bit_array_slice")
pub fn slice(
  from string: BitArray,
  at position: Int,
  take length: Int,
) -> Result(BitArray, Nil)

pub fn is_utf8(bits: BitArray) -> Bool {
  is_utf8_loop(bits)
}

@target(erlang)
fn is_utf8_loop(bits: BitArray) -> Bool {
  case bits {
    <<>> -> True
    <<_:utf8, rest:bytes>> -> is_utf8_loop(rest)
    _ -> False
  }
}

@target(javascript)
fn is_utf8_loop(bits: BitArray) -> Bool {
  case to_string(bits) {
    Ok(_) -> True
    Error(_) -> False
  }
}

@external(javascript, "../gleam_stdlib.mjs", "bit_array_to_string")
pub fn to_string(bits: BitArray) -> Result(String, Nil) {
  case is_utf8(bits) {
    True -> Ok(unsafe_to_string(bits))
    False -> Error(Nil)
  }
}

@external(erlang, "gleam_stdlib", "identity")
fn unsafe_to_string(a: BitArray) -> String

@external(erlang, "gleam_stdlib", "bit_array_concat")
@external(javascript, "../gleam_stdlib.mjs", "bit_array_concat")
pub fn concat(bit_arrays: List(BitArray)) -> BitArray

@external(erlang, "gleam_stdlib", "base64_encode")
@external(javascript, "../gleam_stdlib.mjs", "base64_encode")
pub fn base64_encode(input: BitArray, padding: Bool) -> String

pub fn base64_decode(encoded: String) -> Result(BitArray, Nil) {
  let padded = case byte_size(from_string(encoded)) % 4 {
    0 -> encoded
    n -> string.append(encoded, string.repeat("=", 4 - n))
  }
  decode64(padded)
}

@external(erlang, "gleam_stdlib", "base64_decode")
@external(javascript, "../gleam_stdlib.mjs", "base64_decode")
fn decode64(a: String) -> Result(BitArray, Nil)

pub fn base64_url_encode(input: BitArray, padding: Bool) -> String {
  input
  |> base64_encode(padding)
  |> string.replace("+", "-")
  |> string.replace("/", "_")
}

pub fn base64_url_decode(encoded: String) -> Result(BitArray, Nil) {
  encoded
  |> string.replace("-", "+")
  |> string.replace("_", "/")
  |> base64_decode()
}

@external(erlang, "gleam_stdlib", "base16_encode")
@external(javascript, "../gleam_stdlib.mjs", "base16_encode")
pub fn base16_encode(input: BitArray) -> String

@external(erlang, "gleam_stdlib", "base16_decode")
@external(javascript, "../gleam_stdlib.mjs", "base16_decode")
pub fn base16_decode(input: String) -> Result(BitArray, Nil)

pub fn inspect(input: BitArray) -> String {
  inspect_loop(input, "<<") <> ">>"
}

fn inspect_loop(input: BitArray, accumulator: String) -> String {
  case input {
    <<>> -> accumulator

    <<x:size(1)>> -> accumulator <> int.to_string(x) <> ":size(1)"
    <<x:size(2)>> -> accumulator <> int.to_string(x) <> ":size(2)"
    <<x:size(3)>> -> accumulator <> int.to_string(x) <> ":size(3)"
    <<x:size(4)>> -> accumulator <> int.to_string(x) <> ":size(4)"
    <<x:size(5)>> -> accumulator <> int.to_string(x) <> ":size(5)"
    <<x:size(6)>> -> accumulator <> int.to_string(x) <> ":size(6)"
    <<x:size(7)>> -> accumulator <> int.to_string(x) <> ":size(7)"

    <<x, rest:bits>> -> {
      let suffix = case rest {
        <<>> -> ""
        _ -> ", "
      }

      let accumulator = accumulator <> int.to_string(x) <> suffix
      inspect_loop(rest, accumulator)
    }

    _ -> accumulator
  }
}

pub fn compare(a: BitArray, with b: BitArray) -> order.Order {
  case a, b {
    <<first_byte, first_rest:bits>>, <<second_byte, second_rest:bits>> ->
      case first_byte, second_byte {
        f, s if f > s -> order.Gt
        f, s if f < s -> order.Lt
        _, _ -> compare(first_rest, second_rest)
      }

    <<>>, <<>> -> order.Eq
    _, <<>> -> order.Gt
    <<>>, _ -> order.Lt
    first, second ->
      case bit_array_to_int_and_size(first), bit_array_to_int_and_size(second) {
        #(a, _), #(b, _) if a > b -> order.Gt
        #(a, _), #(b, _) if a < b -> order.Lt
        #(_, size_a), #(_, size_b) if size_a > size_b -> order.Gt
        #(_, size_a), #(_, size_b) if size_a < size_b -> order.Lt
        _, _ -> order.Eq
      }
  }
}

@external(erlang, "gleam_stdlib", "bit_array_to_int_and_size")
@external(javascript, "../gleam_stdlib.mjs", "bit_array_to_int_and_size")
fn bit_array_to_int_and_size(a: BitArray) -> #(Int, Int)

@external(javascript, "../gleam_stdlib.mjs", "bit_array_starts_with")
pub fn starts_with(bits: BitArray, prefix: BitArray) -> Bool {
  let prefix_size = bit_size(prefix)

  case bits {
    <<pref:bits-size(prefix_size), _:bits>> if pref == prefix -> True
    _ -> False
  }
}`,
  'gleam/option': `pub type Option(a) {
  Some(a)
  None
}

pub fn all(list: List(Option(a))) -> Option(List(a)) {
  all_loop(list, [])
}

fn all_loop(list: List(Option(a)), acc: List(a)) -> Option(List(a)) {
  case list {
    [] -> Some(reverse(acc))
    [None, ..] -> None
    [Some(first), ..rest] -> all_loop(rest, [first, ..acc])
  }
}

@external(erlang, "lists", "reverse")
fn reverse(list: List(a)) -> List(a) {
  reverse_and_prepend(list, [])
}

fn reverse_and_prepend(list prefix: List(a), to suffix: List(a)) -> List(a) {
  case prefix {
    [] -> suffix
    [first, ..rest] -> reverse_and_prepend(list: rest, to: [first, ..suffix])
  }
}

pub fn is_some(option: Option(a)) -> Bool {
  option != None
}

pub fn is_none(option: Option(a)) -> Bool {
  option == None
}

pub fn to_result(option: Option(a), e) -> Result(a, e) {
  case option {
    Some(a) -> Ok(a)
    None -> Error(e)
  }
}

pub fn from_result(result: Result(a, e)) -> Option(a) {
  case result {
    Ok(a) -> Some(a)
    Error(_) -> None
  }
}

pub fn unwrap(option: Option(a), or default: a) -> a {
  case option {
    Some(x) -> x
    None -> default
  }
}

pub fn lazy_unwrap(option: Option(a), or default: fn() -> a) -> a {
  case option {
    Some(x) -> x
    None -> default()
  }
}

pub fn map(over option: Option(a), with fun: fn(a) -> b) -> Option(b) {
  case option {
    Some(x) -> Some(fun(x))
    None -> None
  }
}

pub fn flatten(option: Option(Option(a))) -> Option(a) {
  case option {
    Some(x) -> x
    None -> None
  }
}

pub fn then(option: Option(a), apply fun: fn(a) -> Option(b)) -> Option(b) {
  case option {
    Some(x) -> fun(x)
    None -> None
  }
}

pub fn or(first: Option(a), second: Option(a)) -> Option(a) {
  case first {
    Some(_) -> first
    None -> second
  }
}

pub fn lazy_or(first: Option(a), second: fn() -> Option(a)) -> Option(a) {
  case first {
    Some(_) -> first
    None -> second()
  }
}

pub fn values(options: List(Option(a))) -> List(a) {
  values_loop(options, [])
}

fn values_loop(list: List(Option(a)), acc: List(a)) -> List(a) {
  case list {
    [] -> reverse(acc)
    [None, ..rest] -> values_loop(rest, acc)
    [Some(first), ..rest] -> values_loop(rest, [first, ..acc])
  }
}`,
  'gleam/bytes_tree': `
import gleam/bit_array
import gleam/list
import gleam/string_tree.{type StringTree}

pub opaque type BytesTree {
  Bytes(BitArray)
  Text(StringTree)
  Many(List(BytesTree))
}

pub fn new() -> BytesTree {
  concat([])
}

pub fn prepend(to second: BytesTree, prefix first: BitArray) -> BytesTree {
  append_tree(from_bit_array(first), second)
}

pub fn append(to first: BytesTree, suffix second: BitArray) -> BytesTree {
  append_tree(first, from_bit_array(second))
}

pub fn prepend_tree(to second: BytesTree, prefix first: BytesTree) -> BytesTree {
  append_tree(first, second)
}

@external(erlang, "gleam_stdlib", "iodata_append")
pub fn append_tree(to first: BytesTree, suffix second: BytesTree) -> BytesTree {
  case second {
    Many(trees) -> Many([first, ..trees])
    Text(_) | Bytes(_) -> Many([first, second])
  }
}

pub fn prepend_string(to second: BytesTree, prefix first: String) -> BytesTree {
  append_tree(from_string(first), second)
}

pub fn append_string(to first: BytesTree, suffix second: String) -> BytesTree {
  append_tree(first, from_string(second))
}

@external(erlang, "gleam_stdlib", "identity")
pub fn concat(trees: List(BytesTree)) -> BytesTree {
  Many(trees)
}

pub fn concat_bit_arrays(bits: List(BitArray)) -> BytesTree {
  bits
  |> list.map(from_bit_array)
  |> concat()
}

@external(erlang, "gleam_stdlib", "wrap_list")
pub fn from_string(string: String) -> BytesTree {
  Text(string_tree.from_string(string))
}

@external(erlang, "gleam_stdlib", "wrap_list")
pub fn from_string_tree(tree: string_tree.StringTree) -> BytesTree {
  Text(tree)
}

pub fn from_bit_array(bits: BitArray) -> BytesTree {
  bits
  |> bit_array.pad_to_bytes
  |> wrap_list
}

@external(erlang, "gleam_stdlib", "wrap_list")
fn wrap_list(bits: BitArray) -> BytesTree {
  Bytes(bits)
}

@external(erlang, "erlang", "list_to_bitstring")
pub fn to_bit_array(tree: BytesTree) -> BitArray {
  [[tree]]
  |> to_list([])
  |> list.reverse
  |> bit_array.concat
}

fn to_list(stack: List(List(BytesTree)), acc: List(BitArray)) -> List(BitArray) {
  case stack {
    [] -> acc

    [[], ..remaining_stack] -> to_list(remaining_stack, acc)

    [[Bytes(bits), ..rest], ..remaining_stack] ->
      to_list([rest, ..remaining_stack], [bits, ..acc])

    [[Text(tree), ..rest], ..remaining_stack] -> {
      let bits = bit_array.from_string(string_tree.to_string(tree))
      to_list([rest, ..remaining_stack], [bits, ..acc])
    }

    [[Many(trees), ..rest], ..remaining_stack] ->
      to_list([trees, rest, ..remaining_stack], acc)
  }
}

@external(erlang, "erlang", "iolist_size")
pub fn byte_size(tree: BytesTree) -> Int {
  [[tree]]
  |> to_list([])
  |> list.fold(0, fn(acc, bits) { bit_array.byte_size(bits) + acc })
}`,
  'gleam/pair': `pub fn first(pair: #(a, b)) -> a {
  let #(a, _) = pair
  a
}

pub fn second(pair: #(a, b)) -> b {
  let #(_, a) = pair
  a
}

pub fn swap(pair: #(a, b)) -> #(b, a) {
  let #(a, b) = pair
  #(b, a)
}

pub fn map_first(of pair: #(a, b), with fun: fn(a) -> c) -> #(c, b) {
  let #(a, b) = pair
  #(fun(a), b)
}

pub fn map_second(of pair: #(a, b), with fun: fn(b) -> c) -> #(a, c) {
  let #(a, b) = pair
  #(a, fun(b))
}

pub fn new(first: a, second: b) -> #(a, b) {
  #(first, second)
}`,
  'gleam/result': `
import gleam/list

pub fn is_ok(result: Result(a, e)) -> Bool {
  case result {
    Error(_) -> False
    Ok(_) -> True
  }
}

pub fn is_error(result: Result(a, e)) -> Bool {
  case result {
    Ok(_) -> False
    Error(_) -> True
  }
}

pub fn map(over result: Result(a, e), with fun: fn(a) -> b) -> Result(b, e) {
  case result {
    Ok(x) -> Ok(fun(x))
    Error(e) -> Error(e)
  }
}

pub fn map_error(
  over result: Result(a, e),
  with fun: fn(e) -> f,
) -> Result(a, f) {
  case result {
    Ok(x) -> Ok(x)
    Error(error) -> Error(fun(error))
  }
}

pub fn flatten(result: Result(Result(a, e), e)) -> Result(a, e) {
  case result {
    Ok(x) -> x
    Error(error) -> Error(error)
  }
}

pub fn try(
  result: Result(a, e),
  apply fun: fn(a) -> Result(b, e),
) -> Result(b, e) {
  case result {
    Ok(x) -> fun(x)
    Error(e) -> Error(e)
  }
}

pub fn unwrap(result: Result(a, e), or default: a) -> a {
  case result {
    Ok(v) -> v
    Error(_) -> default
  }
}

pub fn lazy_unwrap(result: Result(a, e), or default: fn() -> a) -> a {
  case result {
    Ok(v) -> v
    Error(_) -> default()
  }
}

pub fn unwrap_error(result: Result(a, e), or default: e) -> e {
  case result {
    Ok(_) -> default
    Error(e) -> e
  }
}

pub fn or(first: Result(a, e), second: Result(a, e)) -> Result(a, e) {
  case first {
    Ok(_) -> first
    Error(_) -> second
  }
}

pub fn lazy_or(
  first: Result(a, e),
  second: fn() -> Result(a, e),
) -> Result(a, e) {
  case first {
    Ok(_) -> first
    Error(_) -> second()
  }
}

pub fn all(results: List(Result(a, e))) -> Result(List(a), e) {
  list.try_map(results, fn(result) { result })
}

pub fn partition(results: List(Result(a, e))) -> #(List(a), List(e)) {
  partition_loop(results, [], [])
}

fn partition_loop(results: List(Result(a, e)), oks: List(a), errors: List(e)) {
  case results {
    [] -> #(oks, errors)
    [Ok(a), ..rest] -> partition_loop(rest, [a, ..oks], errors)
    [Error(e), ..rest] -> partition_loop(rest, oks, [e, ..errors])
  }
}

pub fn replace(result: Result(a, e), value: b) -> Result(b, e) {
  case result {
    Ok(_) -> Ok(value)
    Error(error) -> Error(error)
  }
}

pub fn replace_error(result: Result(a, e), error: f) -> Result(a, f) {
  case result {
    Ok(x) -> Ok(x)
    Error(_) -> Error(error)
  }
}

pub fn values(results: List(Result(a, e))) -> List(a) {
  list.filter_map(results, fn(result) { result })
}

pub fn try_recover(
  result: Result(a, e),
  with fun: fn(e) -> Result(a, f),
) -> Result(a, f) {
  case result {
    Ok(value) -> Ok(value)
    Error(error) -> fun(error)
  }
}`,
  'gleam/dict': `import gleam/option.{type Option}

pub type Dict(key, value)

type TransientDict(key, value)

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../dict.mjs", "toTransient")
fn to_transient(dict: Dict(key, value)) -> TransientDict(key, value)

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../dict.mjs", "fromTransient")
fn from_transient(transient: TransientDict(key, value)) -> Dict(key, value)

@external(erlang, "maps", "size")
@external(javascript, "../dict.mjs", "size")
pub fn size(dict: Dict(k, v)) -> Int

pub fn is_empty(dict: Dict(k, v)) -> Bool {
  size(dict) == 0
}

@external(erlang, "maps", "to_list")
pub fn to_list(dict: Dict(k, v)) -> List(#(k, v)) {
  fold(dict, from: [], with: fn(acc, key, value) { [#(key, value), ..acc] })
}

@external(erlang, "maps", "from_list")
pub fn from_list(list: List(#(k, v))) -> Dict(k, v) {
  from_list_loop(to_transient(new()), list)
}

fn from_list_loop(
  transient: TransientDict(k, v),
  list: List(#(k, v)),
) -> Dict(k, v) {
  case list {
    [] -> from_transient(transient)
    [#(key, value), ..rest] ->
      from_list_loop(transient_insert(key, value, transient), rest)
  }
}

@external(javascript, "../dict.mjs", "has")
pub fn has_key(dict: Dict(k, v), key: k) -> Bool {
  do_has_key(key, dict)
}

@external(erlang, "maps", "is_key")
fn do_has_key(key: k, dict: Dict(k, v)) -> Bool

@external(erlang, "maps", "new")
@external(javascript, "../dict.mjs", "make")
pub fn new() -> Dict(k, v)

@external(erlang, "gleam_stdlib", "map_get")
@external(javascript, "../dict.mjs", "get")
pub fn get(from: Dict(k, v), get: k) -> Result(v, Nil)

@external(javascript, "../dict.mjs", "insert")
pub fn insert(into dict: Dict(k, v), for key: k, insert value: v) -> Dict(k, v) {
  do_insert(key, value, dict)
}

@external(erlang, "maps", "put")
fn do_insert(key: k, value: v, dict: Dict(k, v)) -> Dict(k, v)

@external(erlang, "maps", "put")
@external(javascript, "../dict.mjs", "destructiveTransientInsert")
fn transient_insert(
  key: k,
  value: v,
  transient: TransientDict(k, v),
) -> TransientDict(k, v)

@external(javascript, "../dict.mjs", "map")
pub fn map_values(in dict: Dict(k, v), with fun: fn(k, v) -> a) -> Dict(k, a) {
  do_map_values(fun, dict)
}

@external(erlang, "maps", "map")
fn do_map_values(f: fn(k, v) -> a, dict: Dict(k, v)) -> Dict(k, a)

@external(erlang, "maps", "keys")
pub fn keys(dict: Dict(k, v)) -> List(k) {
  fold(dict, [], fn(acc, key, _value) { [key, ..acc] })
}

@external(erlang, "maps", "values")
pub fn values(dict: Dict(k, v)) -> List(v) {
  fold(dict, [], fn(acc, _key, value) { [value, ..acc] })
}

pub fn filter(
  in dict: Dict(k, v),
  keeping predicate: fn(k, v) -> Bool,
) -> Dict(k, v) {
  do_filter(predicate, dict)
}

@external(erlang, "maps", "filter")
fn do_filter(f: fn(k, v) -> Bool, dict: Dict(k, v)) -> Dict(k, v) {
  to_transient(new())
  |> fold(over: dict, with: fn(transient, key, value) {
    case f(key, value) {
      True -> transient_insert(key, value, transient)
      False -> transient
    }
  })
  |> from_transient
}

pub fn take(from dict: Dict(k, v), keeping desired_keys: List(k)) -> Dict(k, v) {
  do_take(desired_keys, dict)
}

@external(erlang, "maps", "with")
fn do_take(desired_keys: List(k), dict: Dict(k, v)) -> Dict(k, v) {
  do_take_loop(dict, desired_keys, to_transient(new()))
}

fn do_take_loop(
  dict: Dict(k, v),
  desired_keys: List(k),
  acc: TransientDict(k, v),
) -> Dict(k, v) {
  case desired_keys {
    [] -> from_transient(acc)
    [key, ..rest] ->
      case get(dict, key) {
        Ok(value) -> do_take_loop(dict, rest, transient_insert(key, value, acc))
        Error(_) -> do_take_loop(dict, rest, acc)
      }
  }
}

@external(erlang, "maps", "merge")
pub fn merge(into dict: Dict(k, v), from new_entries: Dict(k, v)) -> Dict(k, v) {
  combine(dict, new_entries, fn(_, new_entry) { new_entry })
}

pub fn delete(from dict: Dict(k, v), delete key: k) -> Dict(k, v) {
  to_transient(dict) |> transient_delete(key, _) |> from_transient
}

@external(erlang, "maps", "remove")
@external(javascript, "../dict.mjs", "destructiveTransientDelete")
fn transient_delete(a: k, b: TransientDict(k, v)) -> TransientDict(k, v)

pub fn drop(from dict: Dict(k, v), drop disallowed_keys: List(k)) -> Dict(k, v) {
  do_drop(disallowed_keys, dict)
}

@external(erlang, "maps", "without")
fn do_drop(disallowed_keys: List(k), dict: Dict(k, v)) -> Dict(k, v) {
  drop_loop(to_transient(dict), disallowed_keys)
}

fn drop_loop(
  transient: TransientDict(k, v),
  disallowed_keys: List(k),
) -> Dict(k, v) {
  case disallowed_keys {
    [] -> from_transient(transient)
    [key, ..rest] -> drop_loop(transient_delete(key, transient), rest)
  }
}

pub fn upsert(
  in dict: Dict(k, v),
  update key: k,
  with fun: fn(Option(v)) -> v,
) -> Dict(k, v) {
  case get(dict, key) {
    Ok(value) -> insert(dict, key, fun(option.Some(value)))
    Error(_) -> insert(dict, key, fun(option.None))
  }
}

@external(javascript, "../dict.mjs", "fold")
pub fn fold(
  over dict: Dict(k, v),
  from initial: acc,
  with fun: fn(acc, k, v) -> acc,
) -> acc {
  let fun = fn(key, value, acc) { fun(acc, key, value) }
  do_fold(fun, initial, dict)
}

@external(erlang, "maps", "fold")
fn do_fold(fun: fn(k, v, acc) -> acc, initial: acc, dict: Dict(k, v)) -> acc

pub fn each(dict: Dict(k, v), fun: fn(k, v) -> a) -> Nil {
  fold(dict, Nil, fn(nil, k, v) {
    fun(k, v)
    nil
  })
}

pub fn combine(
  dict: Dict(k, v),
  other: Dict(k, v),
  with fun: fn(v, v) -> v,
) -> Dict(k, v) {
  do_combine(fn(_, l, r) { fun(l, r) }, dict, other)
}

@external(erlang, "maps", "merge_with")
fn do_combine(
  combine: fn(k, v, v) -> v,
  left: Dict(k, v),
  right: Dict(k, v),
) -> Dict(k, v) {
  let #(big, small, combine) = case size(left) >= size(right) {
    True -> #(left, right, combine)
    False -> #(right, left, fn(k, l, r) { combine(k, r, l) })
  }

  to_transient(big)
  |> fold(over: small, with: fn(transient, key, value) {
    let update = fn(existing) { combine(key, existing, value) }
    transient_update_with(key, update, value, transient)
  })
  |> from_transient
}

@external(erlang, "maps", "update_with")
@external(javascript, "../dict.mjs", "destructiveTransientUpdateWith")
fn transient_update_with(
  key: k,
  fun: fn(v) -> v,
  init: v,
  transient: TransientDict(k, v),
) -> TransientDict(k, v)

@internal
pub fn group(key: fn(v) -> k, list: List(v)) -> Dict(k, List(v)) {
  group_loop(to_transient(new()), key, list)
}

fn group_loop(
  transient: TransientDict(k, List(v)),
  to_key: fn(v) -> k,
  list: List(v),
) -> Dict(k, List(v)) {
  case list {
    [] -> from_transient(transient)
    [value, ..rest] -> {
      let key = to_key(value)
      let update = fn(existing) { [value, ..existing] }

      transient
      |> transient_update_with(key, update, [value], _)
      |> group_loop(to_key, rest)
    }
  }
}`,
  'gleam/order': `pub type Order {
  Lt

  Eq

  Gt
}

pub fn negate(order: Order) -> Order {
  case order {
    Lt -> Gt
    Eq -> Eq
    Gt -> Lt
  }
}

pub fn to_int(order: Order) -> Int {
  case order {
    Lt -> -1
    Eq -> 0
    Gt -> 1
  }
}

pub fn compare(a: Order, with b: Order) -> Order {
  case a, b {
    x, y if x == y -> Eq
    Lt, _ | Eq, Gt -> Lt
    _, _ -> Gt
  }
}

pub fn reverse(orderer: fn(a, a) -> Order) -> fn(a, a) -> Order {
  fn(a, b) { orderer(b, a) }
}

pub fn break_tie(in order: Order, with other: Order) -> Order {
  case order {
    Lt | Gt -> order
    Eq -> other
  }
}

pub fn lazy_break_tie(in order: Order, with comparison: fn() -> Order) -> Order {
  case order {
    Lt | Gt -> order
    Eq -> comparison()
  }
}`,
  'gleam/string_tree': `import gleam/list

pub type StringTree

pub fn new() -> StringTree {
  from_strings([])
}

pub fn prepend(to tree: StringTree, prefix prefix: String) -> StringTree {
  append_tree(from_string(prefix), tree)
}

pub fn append(to tree: StringTree, suffix second: String) -> StringTree {
  append_tree(tree, from_string(second))
}

pub fn prepend_tree(
  to tree: StringTree,
  prefix prefix: StringTree,
) -> StringTree {
  append_tree(prefix, tree)
}

@external(erlang, "gleam_stdlib", "iodata_append")
@external(javascript, "../gleam_stdlib.mjs", "add")
pub fn append_tree(to tree: StringTree, suffix suffix: StringTree) -> StringTree

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "concat")
pub fn from_strings(strings: List(String)) -> StringTree

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "concat")
pub fn concat(trees: List(StringTree)) -> StringTree

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn from_string(string: String) -> StringTree

@external(erlang, "unicode", "characters_to_binary")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn to_string(tree: StringTree) -> String

@external(erlang, "erlang", "iolist_size")
@external(javascript, "../gleam_stdlib.mjs", "length")
pub fn byte_size(tree: StringTree) -> Int

pub fn join(trees: List(StringTree), with sep: String) -> StringTree {
  trees
  |> list.intersperse(from_string(sep))
  |> concat
}

@external(erlang, "string", "lowercase")
@external(javascript, "../gleam_stdlib.mjs", "lowercase")
pub fn lowercase(tree: StringTree) -> StringTree

@external(erlang, "string", "uppercase")
@external(javascript, "../gleam_stdlib.mjs", "uppercase")
pub fn uppercase(tree: StringTree) -> StringTree

@external(erlang, "string", "reverse")
pub fn reverse(tree: StringTree) -> StringTree {
  tree
  |> to_string
  |> do_to_graphemes
  |> list.reverse
  |> from_strings
}

@external(javascript, "../gleam_stdlib.mjs", "graphemes")
fn do_to_graphemes(string: String) -> List(String)

type Direction {
  All
}

@external(javascript, "../gleam_stdlib.mjs", "split")
pub fn split(tree: StringTree, on pattern: String) -> List(StringTree) {
  erl_split(tree, pattern, All)
}

@external(erlang, "string", "split")
fn erl_split(a: StringTree, b: String, c: Direction) -> List(StringTree)

@external(erlang, "gleam_stdlib", "string_replace")
@external(javascript, "../gleam_stdlib.mjs", "string_replace")
pub fn replace(
  in tree: StringTree,
  each pattern: String,
  with substitute: String,
) -> StringTree

@external(erlang, "string", "equal")
pub fn is_equal(a: StringTree, b: StringTree) -> Bool {
  a == b
}

@external(erlang, "string", "is_empty")
pub fn is_empty(tree: StringTree) -> Bool {
  from_string("") == tree
}`,
  'gleam/dynamic': `import gleam/dict

pub type Dynamic

@external(erlang, "gleam_stdlib", "classify_dynamic")
@external(javascript, "../gleam_stdlib.mjs", "classify_dynamic")
pub fn classify(data: Dynamic) -> String

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn bool(a: Bool) -> Dynamic

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn string(a: String) -> Dynamic

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn float(a: Float) -> Dynamic

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn int(a: Int) -> Dynamic

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn bit_array(a: BitArray) -> Dynamic

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "identity")
pub fn list(a: List(Dynamic)) -> Dynamic

@external(erlang, "erlang", "list_to_tuple")
@external(javascript, "../gleam_stdlib.mjs", "list_to_array")
pub fn array(a: List(Dynamic)) -> Dynamic

pub fn properties(entries: List(#(Dynamic, Dynamic))) -> Dynamic {
  cast(dict.from_list(entries))
}

pub fn nil() -> Dynamic {
  cast(Nil)
}

@external(erlang, "gleam_stdlib", "identity")
@external(javascript, "../gleam_stdlib.mjs", "identity")
fn cast(a: anything) -> Dynamic`,
  'gleam/json': `import gleam/bit_array
import gleam/dict.{type Dict}
import gleam/dynamic.{type Dynamic}
import gleam/dynamic/decode
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string_tree.{type StringTree}

pub type Json

pub type DecodeError {
  UnexpectedEndOfInput
  UnexpectedByte(String)
  UnexpectedSequence(String)
  UnableToDecode(List(decode.DecodeError))
}

pub fn parse(
  from json: String,
  using decoder: decode.Decoder(t),
) -> Result(t, DecodeError) {
  do_parse(from: json, using: decoder)
}

@target(erlang)
fn do_parse(
  from json: String,
  using decoder: decode.Decoder(t),
) -> Result(t, DecodeError) {
  let bits = bit_array.from_string(json)
  parse_bits(bits, decoder)
}

@target(javascript)
fn do_parse(
  from json: String,
  using decoder: decode.Decoder(t),
) -> Result(t, DecodeError) {
  use dynamic_value <- result.try(decode_string(json))
  decode.run(dynamic_value, decoder)
  |> result.map_error(UnableToDecode)
}

@external(javascript, "../gleam_json_ffi.mjs", "decode")
fn decode_string(a: String) -> Result(Dynamic, DecodeError)

pub fn parse_bits(
  from json: BitArray,
  using decoder: decode.Decoder(t),
) -> Result(t, DecodeError) {
  use dynamic_value <- result.try(decode_to_dynamic(json))
  decode.run(dynamic_value, decoder)
  |> result.map_error(UnableToDecode)
}

@external(erlang, "gleam_json_ffi", "decode")
fn decode_to_dynamic(json: BitArray) -> Result(Dynamic, DecodeError) {
  case bit_array.to_string(json) {
    Ok(string) -> decode_string(string)
    Error(Nil) -> Error(UnexpectedByte(""))
  }
}

pub fn to_string(json: Json) -> String {
  do_to_string(json)
}

@external(erlang, "gleam_json_ffi", "json_to_string")
@external(javascript, "../gleam_json_ffi.mjs", "json_to_string")
fn do_to_string(a: Json) -> String

@external(erlang, "gleam_json_ffi", "json_to_iodata")
@external(javascript, "../gleam_json_ffi.mjs", "json_to_string")
pub fn to_string_tree(json: Json) -> StringTree

pub fn string(input: String) -> Json {
  do_string(input)
}

@external(erlang, "gleam_json_ffi", "string")
@external(javascript, "../gleam_json_ffi.mjs", "identity")
fn do_string(a: String) -> Json

pub fn bool(input: Bool) -> Json {
  do_bool(input)
}

@external(erlang, "gleam_json_ffi", "bool")
@external(javascript, "../gleam_json_ffi.mjs", "identity")
fn do_bool(a: Bool) -> Json

pub fn int(input: Int) -> Json {
  do_int(input)
}

@external(erlang, "gleam_json_ffi", "int")
@external(javascript, "../gleam_json_ffi.mjs", "identity")
fn do_int(a: Int) -> Json

pub fn float(input: Float) -> Json {
  do_float(input)
}

@external(erlang, "gleam_json_ffi", "float")
@external(javascript, "../gleam_json_ffi.mjs", "identity")
fn do_float(input input: Float) -> Json

pub fn null() -> Json {
  do_null()
}

@external(erlang, "gleam_json_ffi", "null")
@external(javascript, "../gleam_json_ffi.mjs", "do_null")
fn do_null() -> Json

pub fn nullable(from input: Option(a), of inner_type: fn(a) -> Json) -> Json {
  case input {
    Some(value) -> inner_type(value)
    None -> null()
  }
}

pub fn object(entries: List(#(String, Json))) -> Json {
  do_object(entries)
}

@external(erlang, "gleam_json_ffi", "object")
@external(javascript, "../gleam_json_ffi.mjs", "object")
fn do_object(entries entries: List(#(String, Json))) -> Json

pub fn array(from entries: List(a), of inner_type: fn(a) -> Json) -> Json {
  entries
  |> list.map(inner_type)
  |> preprocessed_array
}

pub fn preprocessed_array(from: List(Json)) -> Json {
  do_preprocessed_array(from)
}

@external(erlang, "gleam_json_ffi", "array")
@external(javascript, "../gleam_json_ffi.mjs", "array")
fn do_preprocessed_array(from from: List(Json)) -> Json

pub fn dict(
  dict: Dict(k, v),
  keys: fn(k) -> String,
  values: fn(v) -> Json,
) -> Json {
  object(dict.fold(dict, [], fn(acc, k, v) { [#(keys(k), values(v)), ..acc] }))
}`,
}
