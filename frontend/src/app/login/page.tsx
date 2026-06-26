import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ redirect?: string; error?: string; msg?: string }>;
};

export default async function LoginRedirectPage({ searchParams }: Props) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.redirect) qs.set("redirect", params.redirect);
  if (params.error) qs.set("error", params.error);
  if (params.msg) qs.set("msg", params.msg);
  const query = qs.toString();
  redirect(query ? `/masuk?${query}` : "/masuk");
}
