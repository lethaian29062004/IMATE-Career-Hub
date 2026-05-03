export interface SubMenuItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

export interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  hasDropdown?: boolean;
  subItems?: SubMenuItem[];
  onClick?: () => void;
}
