import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { payload, month, island, job } = await request.json();
    
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content:
              `Είσαι φιλικός οικονομικός σύμβουλος για εποχιακούς εργαζόμενους. ` +
`Ο χρήστης εργάζεται ${job||"bartender"} στη ${island||"Σέριφο"} το καλοκαίρι. ` +
`Λαμβάνει μηνιαίο μισθό και καθημερινά tips. ` +
`Φιλοσοφία: τα έξοδα να καλύπτονται από τα tips — ο μισθός να μένει ανέπαφος και να αποταμιεύεται. ` +
`Ανάλυσε τα δεδομένα για ${month}:\n${JSON.stringify(payload, null, 2)}\n\n` +
`Δώσε 4-5 insights στα ελληνικά με γνώμονα αυτή τη φιλοσοφία. ` +
`Συμπερίλαβε 1 savings prediction με συγκεκριμένο ποσό € και 1 budget coaching με συγκεκριμένη κατηγορία. ` +
`Φιλικός τόνος. Κάθε insight: ένα μόνο ξεκάθαρο μήνυμα, μέγιστο 2 προτάσεις, με συγκεκριμένα ποσά σε € χωρίς παρενθέσεις.\n` +
`Απάντησε ΜΟΝΟ valid JSON (χωρίς markdown):\n` +
`[{"type":"positive"|"warning"|"tip"|"insight","title":"3-4 λέξεις","message":"...","icon":"emoji"}]`,
          },
        ],
      }),
    });

    const data = await res.json();
    console.log("API response:", JSON.stringify(data));
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
