const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { market, pair, style } = JSON.parse(event.body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Kamu adalah sistem analisis teknikal otomatis profesional seperti Signalynx.
    Analisis kondisi pasar saat ini untuk:
    - Kategori Market: ${market}
    - Pair/Instrumen: ${pair}
    - Gaya Trading: ${style}

    Tugasmu: Berikan keputusan sinyal realistis berdasarkan tren harga & indikator teknikal umum (EMA, RSI, ATR).

    Kembalikan respon HANYA dalam format JSON berikut (tanpa tanda markdown \`\`\`json):
    {
      "signal": "BUY",
      "entry": "64980.01",
      "stopLoss": "65113.00",
      "tp1": "64714.00",
      "tp2": "64448.00",
      "rr": "1:2.0",
      "confidence": "68%",
      "explanation": "Tuliskan penjelasan teknikal rinci di sini mengenai alasan entry, kondisi EMA, RSI, dan level pembatalan sinyal."
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: responseText
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
