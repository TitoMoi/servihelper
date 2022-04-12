import { toHTML } from "ngx-editor";
/**
 *
 * @param editorContent the content in record json format
 * @returns htmlContent in string
 */
export function editorJsonToHtml(editorContent: Record<string, any>): string {
  const htmlContent = toHTML(editorContent);
  return htmlContent;
}
