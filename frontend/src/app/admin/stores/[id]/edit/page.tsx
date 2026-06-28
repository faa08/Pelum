import StoreForm from "@/components/admin/StoreForm";

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StoreForm mode="edit" storeId={id} />;
}
