export async function GET() {
  const r = await fetch("http://20.207.122.201/evaluation-service/auth", {
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
  const data = await r.json();
  return Response.json({ token: data.access_token });
}
