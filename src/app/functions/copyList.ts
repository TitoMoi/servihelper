/**
 *
 * @param objectList the array of objects to clone
 * @returns a new array reference with new cloned object references.
 */
export function copyList(objectList: any[]) {
  return objectList.map((p) => ({ ...p }));
}
