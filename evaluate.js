// api/evaluate.js
module.exports = async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { jobDescription } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Jika ini terjadi, berarti API Key belum masuk ke Vercel atau Anda lupa Redeploy
      return res
        .status(500)
        .json({ error: "API Key tidak ditemukan di server." });
    }

    const systemPrompt = `Anda adalah Sistem Evaluasi AI untuk portofolio Maheza Daud (Davinci).
    Tugas Anda: Evaluasi Job Description (JD) yang diberikan terhadap profil Maheza.
    Profil Maheza: Full-Stack Developer & UI/UX Designer. Ahli Flutter, Figma, Python, integrasi API, Generative AI (Gemini Prompting), Laravel.
    JD dari User: "${jobDescription}"
    
    ATURAN MUTLAK:
    1. Output HARUS dalam format JSON murni.
    2. Jika JD agak meleset dari skill, gunakan logika "Transferable Skills".
    3. Struktur JSON wajib seperti ini:
    {
      "score": "<angka 80-100>%",
      "synergy": "<1-2 kalimat analisis teknis yang meyakinkan mengapa skill Maheza relevan>",
      "verdict": "<Keputusan tegas, misal: DIREKOMENDASIKAN UNTUK INTERVIEW TEKNIS>"
    }`;

    // Gunakan fungsi fetch bawaan Node.js
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    const data = await response.json();

    // Pengecekan jika Google menolak request (misal API key salah)
    if (data.error) {
      console.error("Google API Error:", data.error);
      return res.status(500).json({ error: "Google AI API menolak request." });
    }

    const aiResponseText = data.candidates[0].content.parts[0].text;
    const aiData = JSON.parse(aiResponseText);

    return res.status(200).json(aiData);
  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};
