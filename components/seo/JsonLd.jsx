// Renders a non-visual JSON-LD structured-data script. No layout impact.
export default function JsonLd({ data }) {
  if (!data) return null;
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.filter(Boolean).map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
