export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-4 space-y-2">
      <h1 className="text-lg font-bold text-brand-ink">Customer Profile</h1>
      <p className="text-xs text-brand-muted font-mono">Account ID: {id}</p>
    </div>
  );
}