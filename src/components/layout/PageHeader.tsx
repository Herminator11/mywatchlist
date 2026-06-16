interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div
      className="rounded-xl px-4 py-3 mb-6"
      style={{ backgroundColor: "var(--accent)" }}
    >
      <h1 className="text-black font-bold text-xl tracking-tight">{title}</h1>
    </div>
  );
}