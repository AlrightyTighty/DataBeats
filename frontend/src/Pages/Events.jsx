import bed from "../assets/graphics/test_image_bed.jpg";

export default function Events() {
  const item = {
    eventId: 1,
    title: "Sleep Party - I am so tired",
    musicianName: "Pillow",
    musicianId: 1001,
    eventPic: bed,
    eventTime: new Date(Date.now() + 3*24*3600*1000).toISOString(),
  }

   return (
    <div style={{ padding: 24, marginTop: 120 }}>
      <h1>Events</h1>
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 12,
          padding: 12,
          display: "flex",
          gap: 12,
          alignItems: "center",
          maxWidth: 680
        }}
      >
        <img
          src={item.eventPic}
          alt={item.title}
          style={{ width: 180, height: 120, objectFit: "cover", borderRadius: 8 }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{item.title}</div>
          <div style={{ opacity: 0.8 }}>{item.musicianName}</div>
          <div style={{ opacity: 0.8 }}>
            {new Date(item.eventTime).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}