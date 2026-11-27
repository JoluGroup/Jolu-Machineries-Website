import type { AnchorHTMLAttributes } from "react";

/**
 * Anchor for registry-sourced links (registry C2-C8). When the underlying claim is withheld or hidden
 * (VITE_CLAIMS_STRICT=true) the href is undefined and nothing is rendered, so no dead or "undefined" link appears.
 */
const RegistryLink = ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
  href ? (
    <a href={href} {...rest}>
      {children}
    </a>
  ) : null;

export default RegistryLink;
