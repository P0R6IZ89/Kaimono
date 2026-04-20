export default function PlannedDetails({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Planned Details for {params.id}</h1>
    </div>
  );
}
