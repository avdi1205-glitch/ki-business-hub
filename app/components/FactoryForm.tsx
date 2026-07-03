type Props = {
  category: string;
  setCategory: (value: string) => void;

  count: string;
  setCount: (value: string) => void;

  words: string;
  setWords: (value: string) => void;

  style: string;
  setStyle: (value: string) => void;

  audience: string;
  setAudience: (value: string) => void;

  affiliateTool: string;
  setAffiliateTool: (value: string) => void;

  seoStrength: string;
  setSeoStrength: (value: string) => void;

  articleType: string;
  setArticleType: (value: string) => void;

  loading: boolean;

  startFactory: () => void;
};

export default function FactoryForm({
  category,
  setCategory,

  count,
  setCount,

  words,
  setWords,

  style,
  setStyle,

  audience,
  setAudience,

  affiliateTool,
  setAffiliateTool,

  seoStrength,
  setSeoStrength,

  articleType,
  setArticleType,

  loading,

  startFactory,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-8">

      <div className="grid gap-5 md:grid-cols-2">

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl bg-slate-900 p-4"
        >
          <option>KI Tools</option>
          <option>Hosting</option>
          <option>VPN</option>
          <option>Automation</option>
          <option>Affiliate</option>
        </select>

        <select
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="rounded-xl bg-slate-900 p-4"
        >
          <option>1</option>
          <option>3</option>
          <option>5</option>
          <option>10</option>
        </select>

        <select
          value={words}
          onChange={(e) => setWords(e.target.value)}
          className="rounded-xl bg-slate-900 p-4"
        >
          <option>1000</option>
          <option>1500</option>
          <option>2000</option>
          <option>3000</option>
        </select>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="rounded-xl bg-slate-900 p-4"
        >
          <option>Professionell</option>
          <option>Locker</option>
          <option>Experte</option>
        </select>

        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="rounded-xl bg-slate-900 p-4"
        >
          <option>Anfänger</option>
          <option>Unternehmer</option>
          <option>Agenturen</option>
        </select>

        <select
          value={affiliateTool}
          onChange={(e) => setAffiliateTool(e.target.value)}
          className="rounded-xl bg-slate-900 p-4"
        >
          <option>Automatisch</option>
          <option>Hostinger</option>
          <option>ChatGPT Plus</option>
          <option>NordVPN</option>
          <option>Zapier</option>
          <option>Make</option>
          <option>n8n</option>
        </select>

        <select
          value={seoStrength}
          onChange={(e) => setSeoStrength(e.target.value)}
          className="rounded-xl bg-slate-900 p-4"
        >
          <option>Standard</option>
          <option>Stark</option>
          <option>Maximal</option>
        </select>

        <select
          value={articleType}
          onChange={(e) => setArticleType(e.target.value)}
          className="rounded-xl bg-slate-900 p-4"
        >
          <option>Ratgeber</option>
          <option>Vergleich</option>
          <option>Testbericht</option>
          <option>Liste</option>
        </select>

      </div>

      <button
        disabled={loading}
        onClick={startFactory}
        className="mt-8 rounded-xl bg-green-600 px-8 py-4 font-bold hover:bg-green-700 disabled:opacity-50"
      >
        {loading
          ? "Generiere..."
          : "🚀 Content Factory starten"}
      </button>

    </div>
  );
}