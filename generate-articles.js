const topics = [
  "KI-gestützte Kundensegmentierung für E-Commerce",
  "Automatisierung von HR-Prozessen mit KI",
  "ChatGPT für Content Marketing Strategie",
  "Deepfake-Erkennung mit Machine Learning",
  "KI-Analyse von Social Media Trends",
  "Predictive Analytics für Bestandsverwaltung",
  "Voice-Assistants in der Geschäftskommunikation",
  "Computer Vision für Qualitätskontrolle",
  "NLP für Sentiment-Analyse von Kundenfeedback",
  "Transfer Learning in praktischen Anwendungen",
  "KI in der medizinischen Diagnostik",
  "Generative AI für Produktentwicklung",
  "Blockchain und KI Integration",
  "Ethik und Bias in Machine Learning",
  "KI-basierte Preisoptimierung",
];

const generateArticles = async () => {
  console.log("🚀 Starte Artikel-Generierung...\n");
  
  for (let i = 0; i < topics.length; i++) {
    try {
      console.log(`[${i + 1}/${topics.length}] ${topics[i]}...`);
      
      const response = await fetch("http://localhost:3000/api/content-factory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: [{ text: topics[i] }],
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`  ✅ ${data.created} Artikel erstellt\n`);
      } else {
        console.log(`  ⚠️ Fehler: ${data.error}\n`);
      }
      
      // Kurze Pause zwischen Requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`  ❌ Fehler: ${error.message}\n`);
    }
  }
  
  console.log("✨ Artikel-Generierung abgeschlossen!");
};

generateArticles();
