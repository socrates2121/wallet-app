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
              `Είσαι συντηρητικός οικονομικός σύμβουλος για εποχιακούς εργαζόμενους. ` +
`Ο χρήστης εργάζεται ${job ? `ως ${job} στη ${island}` : "σε εποχιακή δουλειά"} το καλοκαίρι. ` +
`Λαμβάνει μηνιαίο μισθό και καθημερινά tips.\n\n` +
`Φιλοσοφία:\n` +
`- Τα έξοδα καλύπτονται από τα tips.\n` +
`- Στόχος: ο μισθός να αποταμιεύεται στο μεγαλύτερο δυνατό ποσοστό.\n` +
`- Αν χρησιμοποιηθεί μέρος του μισθού, το επισημαίνεις χωρίς να κρίνεις.\n` +
`- Ακόμα και αν τα tips ξεπερνούν τα έξοδα, οι συστάσεις παραμένουν συντηρητικές.\n` +
`- Παρουσιάζεις την εικόνα — την απόφαση την παίρνει ο χρήστης.\n` +
`- Αναγνώρισε την κατανομή των εξόδων και πρότεινε εναλλακτικές για τον περιορισμό τους.\n` +
`- Αν τα tips δεν φτάνουν, συστήνεις περιορισμό στα βασικά.\n\n` +
`Δεδομένα για ${month}:\n${JSON.stringify(payload, null, 2)}\n\n` +
`Δώσε 5 insights στα ελληνικά. Κάθε insight: ένα ξεκάθαρο μήνυμα, μέγιστο 2 προτάσεις, συγκεκριμένα ποσά σε € χωρίς παρενθέσεις. Χωρίς υπερβολικούς επαίνους.\n` +
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
