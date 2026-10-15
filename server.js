
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const API_KEY = process.env.HL_API_KEY;
const DEVELOPER_UID = process.env.HL_DEVELOPER_UID;

app.get("/api/freefire-player", async (req, res) => {
  const uid = String(req.query.uid || "").trim();
  const region = String(req.query.region || "me").toLowerCase();

  if (!/^\d{6,15}$/.test(uid)) {
    return res.status(400).json({ error: "UID غير صحيح" });
  }

  if (!API_KEY || !DEVELOPER_UID) {
    return res.status(503).json({
      error: "لم يتم إعداد مفاتيح API في الخادم"
    });
  }

  try {
    const url = new URL(
      "https://proapis.hlgamingofficial.com/main/games/freefire/account/api"
    );
    url.searchParams.set("sectionName", "AccountInfo");
    url.searchParams.set("PlayerUid", uid);
    url.searchParams.set("region", region);
    url.searchParams.set("useruid", DEVELOPER_UID);
    url.searchParams.set("api", API_KEY);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "تعذر فحص UID" });
    }

    const name = data?.result?.AccountName;
    if (!name) {
      return res.status(404).json({
        error: "لم يتم العثور على اسم اللاعب",
        details: data
      });
    }

    return res.json({ uid, name, region });
  } catch (error) {
    return res.status(502).json({
      error: "فشل الاتصال بخدمة فحص Free Fire"
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
