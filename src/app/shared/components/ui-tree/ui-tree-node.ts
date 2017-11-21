/**
 * 節點結構
 */
export interface UiTreeNode {
  /**
   * 節點名稱
   */
  name: string;

  /**
   * 是否展開子節點
   */
  collapse: boolean;

  /**
   * 子節點
   */
  children?: UiTreeNode[];
}
