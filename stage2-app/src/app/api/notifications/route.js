export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const tokenRes = await fetch("http://20.207.122.201/evaluation-service/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "rv5982@srmist.edu.in",
      name: "Rishu Varnwal",
      rollNo: "RA2311003011502",
      accessCode: "QkbpxH",
      clientID: "f26c6ee6-eacf-4747-94f5-3aa26c013535",
      clientSecret: "CFpghKQdunbwGYvu"
    })
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  const params = new URLSearchParams();
  if (searchParams.get("limit")) params.set("limit", searchParams.get("limit"));
  if (searchParams.get("page")) params.set("page", searchParams.get("page"));
  if (searchParams.get("notification_type")) params.set("notification_type", searchParams.get("notification_type"));

  const r = await fetch(`http://20.207.122.201/evaluation-service/notifications?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await r.json();
  return Response.json(data);
}
