export interface UiTreeNode {
  name: string;
  collapse: boolean;
  children?: UiTreeNode[];
}
