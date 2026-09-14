import RankingView from "./RankingView";

export default async function RankingPage({ params }) {
  const { id } = await params;
  return <RankingView id={id} />;
}
