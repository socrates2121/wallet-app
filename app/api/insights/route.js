import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { payload, month } = await request.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20251101",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content:
              `Είσαι φιλικός οικονομικός σύμβουλος. Ο χρήστης εργάζεται bartender στη Σέριφο, παρακολουθεί μισθό + tips.\n` +
              `Ανάλυσε τα δεδομένα για ${month}:\n${JSON.stringify(payload, null, 2)}\n\n` +
              `4-5 insights στα ελληνικά, 1-2 προτάσεις το καθένα. Φιλικός τόνος, συγκεκριμένα ποσά €.\n` +
              `Απάντησε ΜΟΝΟ valid JSON (χωρίς markdown):\n` +
              `[{"type":"positive"|"warning"|"tip"|"insight","title":"3-4 λέξεις","message":"...","icon":"emoji"}]`,
          },
        ],
      }),
    });

    const data = await res.json();
    const txt = data.content?.[0]?.text || "[]";
    const insights = JSON.parse(txt.replace(/```json|```/g, "").trim());

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("Insights error:", err);
    return NextResponse.json(
      { insights: [{ type: "warning", title: "Σφάλμα", message: "Δοκίμασε ξανά σε λίγο.", icon: "⚠️" }] },
      { status: 500 }
    );
  }
}
