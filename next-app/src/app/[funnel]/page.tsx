import { FunnelRenderer } from './FunnelRenderer';

export const revalidate = 60;

export default async function FunnelRootPage({
  params,
}: { params: Promise<{ funnel: string }> }) {
  const { funnel } = await params;
  return <FunnelRenderer funnelSlug={funnel} />;
}
