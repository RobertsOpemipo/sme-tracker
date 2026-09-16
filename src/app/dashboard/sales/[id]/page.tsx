export default async function SaleReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-4 space-y-2">
      <h1 className="text-lg font-bold text-brand-ink">Receipt Details</h1>
      <p className="text-xs text-brand-muted font-mono">Order ID: {id}</p>
    </div>
  );
}