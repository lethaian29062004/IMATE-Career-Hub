import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import type { MenuItem } from "@/types/common/menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface HorizontalNavigationBarProps {
  menuItems: MenuItem[];
}

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root data-slot="navigation-menu" data-viewport={viewport} className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)} {...props}>
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return <NavigationMenuPrimitive.List data-slot="navigation-menu-list" className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)} {...props} />;
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />;
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:text-accent-foreground focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
);

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger 
      data-slot="navigation-menu-trigger" 
      className={cn(navigationMenuTriggerStyle(), "group", className)} 
      {...props}
    >
      {children} 
      <ChevronDownIcon className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180" aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className={cn("absolute top-full left-0 isolate z-50 flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:text-accent-foreground hover:text-accent-foreground focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn("data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden", className)}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

function HorizontalNavigationBar({ menuItems }: HorizontalNavigationBarProps) {
  const location = useLocation();
  
  // Helper function to check if a menu item or its subitems are active
  const isItemActive = (item: MenuItem): boolean => {
    if (item.href && location.pathname === item.href) {
      return true;
    }
    if (item.subItems) {
      return item.subItems.some(subItem => {
        const currentPath = location.pathname.split('?')[0];
        return currentPath === subItem.href || currentPath.startsWith(subItem.href + '/');
      });
    }
    return false;
  };

  return (
    <div>
      <NavigationMenu viewport={false} className="z-10 hidden lg:block">
        <NavigationMenuList>
          {menuItems.map((item, index) => {
            const isActive = isItemActive(item);
            return (
              <NavigationMenuItem key={index}>
                {item.hasDropdown ? (
                  <>
                    <NavigationMenuPrimitive.Trigger
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium cursor-pointer relative border-none shadow-none outline-none",
                        "[&>svg:last-child]:hidden"
                      )}
                      style={{
                        color: isActive ? '#5D5FEF' : '#6B7280'
                      } as React.CSSProperties}
                    >
                      <span style={{ color: 'inherit' }}>{item.label}</span>
                      <ChevronDownIcon 
                        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180 inline-block"
                        style={{ color: 'inherit' } as React.CSSProperties}
                        aria-hidden="true" 
                      />
                      <span 
                        className="absolute bottom-0 left-0 right-0 h-0.5 transition-all"
                        style={{
                          backgroundColor: isActive ? '#5D5FEF' : 'transparent'
                        } as React.CSSProperties}
                      />
                    </NavigationMenuPrimitive.Trigger>
                    <NavigationMenuContent>
                      <ul className="flex w-56 flex-col justify-center gap-1 p-2">
                        {item.subItems?.map((subItem, subIndex) => {
                          const Icon = subItem.icon;
                          const isSubItemActive = location.pathname.split('?')[0] === subItem.href || 
                                                 location.pathname.startsWith(subItem.href + '/');
                          return (
                            <li key={subIndex}>
                              <NavigationMenuLink asChild>
                                <Link 
                                  to={subItem.href} 
                                  className={cn(
                                    "rounded-md px-4 py-2 transition-colors",
                                    isSubItemActive
                                      ? "bg-indigo-50 text-indigo-600 font-medium"
                                      : "text-gray-700 hover:bg-gray-50"
                                  )}
                                >
                                  <div className="flex items-center gap-3 py-2">
                                    {Icon && <Icon className={cn(
                                      "h-4 w-4 flex-shrink-0",
                                      isSubItemActive ? "text-indigo-600" : "text-gray-500"
                                    )} />}
                                    <span className="text-sm leading-none font-medium">{subItem.label}</span>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink 
                    asChild 
                    className="relative bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent"
                  >
                    {item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="px-4 py-2 text-sm font-medium transition-colors relative hover:bg-transparent focus:bg-transparent cursor-pointer w-full text-left"
                        style={{
                          color: isActive ? '#5D5FEF' : '#6B7280'
                        } as React.CSSProperties}
                      >
                        <span style={{ color: 'inherit' }}>{item.label}</span>
                        <span 
                          className="absolute bottom-0 left-0 right-0 h-0.5 transition-all"
                          style={{
                            backgroundColor: isActive ? '#5D5FEF' : 'transparent'
                          } as React.CSSProperties}
                        />
                      </button>
                    ) : (
                      <Link 
                        to={item.href ? item.href : "#"} 
                        className="px-4 py-2 text-sm font-medium transition-colors relative hover:bg-transparent focus:bg-transparent w-full"
                        style={{
                          color: isActive ? '#5D5FEF' : '#6B7280'
                        } as React.CSSProperties}
                      >
                        <span style={{ color: 'inherit' }}>{item.label}</span>
                        <span 
                          className="absolute bottom-0 left-0 right-0 h-0.5 transition-all"
                          style={{
                            backgroundColor: isActive ? '#5D5FEF' : 'transparent'
                          } as React.CSSProperties}
                        />
                      </Link>
                    )}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle, HorizontalNavigationBar };
