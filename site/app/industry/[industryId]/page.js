import LearningPage from "@/components/LearningPage";

export default async function IndustryPage({ params }) {
  const { industryId } = await params;
  return <LearningPage industryId={industryId} />;
}