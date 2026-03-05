interface ChartContainerProps {
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export default function ChartContainer({
  children,
  isEmpty = false,
  emptyMessage = 'No data to display.',
}: ChartContainerProps) {
  if (isEmpty) {
    return (
      <div className="h-[300px] flex items-center justify-center text-sm text-[var(--text-muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative h-[300px] w-full">
      {children}
    </div>
  );
}
