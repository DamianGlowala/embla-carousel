import { isReactive, isRef, MaybeRefOrGetter, WatchSource } from 'vue'

export function isWatchSource<T>(
  value: MaybeRefOrGetter<T>
): value is WatchSource<T> {
  return isRef(value) || isReactive(value) || typeof value === 'function'
}
