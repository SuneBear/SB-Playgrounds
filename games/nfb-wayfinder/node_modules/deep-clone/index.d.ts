declare module 'deep-clone' {
  function deepClone<T>(target: T, format?: (key: string) => string): T
  export = deepClone
}
