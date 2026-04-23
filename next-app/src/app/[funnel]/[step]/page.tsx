import { FunnelRenderer } from '../FunnelRenderer';

export const revalidate = 60;

export default async function FunnelStepPage({
  params,
}: { params: Promise<{ funnel: string; step: string }> }) {
  const { funnel, step } = await params;
  return <FunnelRenderer funnelSlug={funnel} stepSlug={step} />;
}
