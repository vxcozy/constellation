import React from "react";

export function OrbitControls(_props: Record<string, unknown>) {
  return null;
}

export function Billboard({
  children,
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return <div data-testid="billboard">{children}</div>;
}

export function Text({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <span data-testid="drei-text" data-fill-opacity={props.fillOpacity}>
      {children}
    </span>
  );
}
