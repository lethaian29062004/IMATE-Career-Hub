export interface CategorySubmit {
  name: string;
}

export interface CategoryUpdate {
  name: string;
  isActive: boolean | null;
}
