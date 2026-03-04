// api/evaluate.js
export default async function handler(req, res) {
  // FAKTA KEAMANAN: Hanya menerima request POST dari frontend Anda
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { jobDescription } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // Mengambil kunci rahasia dari Vercel

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "API Key tidak terkonfigurasi di server." });
    }

    // FAKTA PROMPT ENGINEERING: Memaksa Gemini bertindak sebagai agen evaluasi Anda
    const systemPrompt = `Anda adalah Sistem Evaluasi AI untuk portofolio Maheza Daud (Davinci).
    Tugas Anda: Evaluasi Job Description (JD) yang diberikan terhadap profil Maheza.
    Profil Maheza: Full-Stack Developer & UI/UX Designer. Ahli Flutter, Figma, Python, integrasi API, Generative AI (Gemini Prompting), Laravel.
    JD dari User: "${jobDescription}"
    
    ATURAN MUTLAK:
    1. Output HARUS dalam format JSON murni.
    2. Jika JD agak meleset dari skill, gunakan logika "Transferable Skills" untuk tetap merekomendasikan Maheza.
    3. Struktur JSON wajib seperti ini:
    {
      "score": "<angka 80-100>%",
      "synergy": "<1-2 kalimat analisis teknis yang meyakinkan mengapa skill Maheza relevan dengan JD ini>",
      "verdict": "<Keputusan tegas, misal: DIREKOMENDASIKAN UNTUK INTERVIEW TEKNIS>"
    }`;

    // Memanggil API Gemini versi terbaru (Gemini 2.5 Flash yang sangat cepat)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          // FAKTA: Memaksa LLM agar hanya merespon dengan JSON, bukan teks biasa
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    const data = await response.json();

    // Parsing jawaban JSON dari Gemini dan mengirimkannya kembali ke Frontend
    const aiResponseText = data.candidates[0].content.parts[0].text;
    const aiData = JSON.parse(aiResponseText);

    return res.status(200).json(aiData);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Terjadi kesalahan pada inferensi AI server." });
  }
}
