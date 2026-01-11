/**
 * Ensures that the keys of the map type (T) match exactly the enum type (E).
 * Also ensures that the enum value is added as a `type` key that matches the map key.
 *
 * @example
 * enum OptionEnum {
 *   OPTION_1 = 'OPTION_1',
 *   OPTION_2 = 'OPTION_2',
 * }
 *
 * type OptionMap = {
 *   [OptionEnum.OPTION_1]: { key1: string };
 *   [OptionEnum.OPTION_2]: { key2: string };
 * };
 *
 * type Option = MapToUnionWithTypeFieldAdded<OptionMap, OptionEnum>;
 *
 * // Equivalent to:
 * // { type: OptionEnum.OPTION_1; key1: string } | { type: OptionEnum.OPTION_2; key2: string }
 *
 * // Usage with ts-pattern:
 * const result = match(option)
 *   .with({ type: OptionEnum.OPTION_1 }, (o) => o.key1)
 *   .with({ type: OptionEnum.OPTION_2 }, (o) => o.key2)
 *   .exhaustive();
 */
export type MapToUnionWithTypeFieldAdded<T, E extends keyof T> = [E] extends [keyof T]
  ? { [K in keyof T]: T[K] & { type: K } }[keyof T]
  : never
