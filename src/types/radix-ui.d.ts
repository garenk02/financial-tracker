// Type declarations for @radix-ui/react-popover
declare module '@radix-ui/react-popover' {
  import * as React from 'react';

  // Root
  interface RootProps {
    children?: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
  }
  export const Root: React.FC<RootProps>;

  // Trigger
  interface TriggerProps extends React.ComponentPropsWithoutRef<'button'> {
    asChild?: boolean;
  }
  export const Trigger: React.ForwardRefExoticComponent<TriggerProps & React.RefAttributes<HTMLButtonElement>>;

  // Portal
  interface PortalProps {
    children?: React.ReactNode;
    container?: HTMLElement;
    forceMount?: boolean;
  }
  export const Portal: React.FC<PortalProps>;

  // Content
  interface ContentProps extends React.ComponentPropsWithoutRef<'div'> {
    asChild?: boolean;
    onOpenAutoFocus?: (event: Event) => void;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onFocusOutside?: (event: FocusEvent) => void;
    onInteractOutside?: (event: React.SyntheticEvent) => void;
    forceMount?: boolean;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    avoidCollisions?: boolean;
    collisionBoundary?: Element | null | Array<Element | null>;
    collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
    arrowPadding?: number;
    sticky?: 'partial' | 'always';
    hideWhenDetached?: boolean;
  }
  export const Content: React.ForwardRefExoticComponent<ContentProps & React.RefAttributes<HTMLDivElement>>;

  // Arrow
  interface ArrowProps extends React.ComponentPropsWithoutRef<'svg'> {
    asChild?: boolean;
    width?: number;
    height?: number;
  }
  export const Arrow: React.ForwardRefExoticComponent<ArrowProps & React.RefAttributes<SVGSVGElement>>;

  // Close
  interface CloseProps extends React.ComponentPropsWithoutRef<'button'> {
    asChild?: boolean;
  }
  export const Close: React.ForwardRefExoticComponent<CloseProps & React.RefAttributes<HTMLButtonElement>>;
}
