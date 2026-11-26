export function HoverWord({ children }: { children: string }) {
  return (
    <span className="hover-word">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
