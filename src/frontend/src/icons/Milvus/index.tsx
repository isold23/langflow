import React, { forwardRef } from "react";
import SvgMilvusIcon from "./MilvusIcon";

export const MilvusIcon = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <SvgMilvusIcon ref={ref} {...props} />;
});
