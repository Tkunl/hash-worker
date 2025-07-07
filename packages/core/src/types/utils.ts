export type RequiredWithExclude<T, K extends keyof T = never> = Required<Omit<T, K>> & Pick<T, K>
