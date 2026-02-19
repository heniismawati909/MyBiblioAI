
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, ChatMessage } from "./types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const searchCitations = async (
  query: string, 
  yearFilter: string, 
  isDeepResearch: boolean,
  typeFilter: string,
): Promise<SearchResult> => {
  const currentYear = new Date().getFullYear();
  let yearInstruction = "";
  
  if (yearFilter === "5") {
    yearInstruction = `Utamakan referensi 5 tahun terakhir (${currentYear - 5}-${currentYear}).`;
  } else if (yearFilter === "10") {
    yearInstruction = `Utamakan referensi 10 tahun terakhir (${currentYear - 10}-${currentYear}).`;
  }


  const typeInstruction =
  typeFilter === "e-book"
    ? `FOKUS: hanya E-BOOK. Semua citations[].type harus "ebook". Jangan jurnal/artikel.`
    : typeFilter === "journal"
      ? `FOKUS: hanya JURNAL ilmiah. Semua citations[].type harus "journal". Jangan buku/ebook.`
      : typeFilter === "article"
        ? `FOKUS: hanya ARTIKEL ilmiah (paper/proceedings). Semua citations[].type harus "article". Jangan buku/ebook.`
        : `FOKUS: campuran. citations[].type boleh "ebook" atau "journal" atau "article".`;

  const modelName = isDeepResearch ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config: any = {
    tools: [{ googleSearch: {} }],
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
        synthesis: { type: Type.STRING },
        citations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              title: { type: Type.STRING },
              authors: { type: Type.ARRAY, items: { type: Type.STRING } },
              year: { type: Type.NUMBER },
              publisher: { type: Type.STRING },
              page: { type: Type.NUMBER },
              snippet: { type: Type.STRING },
              sourceUrl: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              type: { type: Type.STRING, description: "ebook | journal | article" },

            },
            required: ["id", "title", "authors", "year", "page", "snippet", "sourceUrl"]
          }
        }
      },
      required: ["query", "synthesis", "citations"]
    }
  };

  // if (isDeepResearch) { ... } else { ... }   // comment atau hapus sementara

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Cari referensi akademik nyata untuk: "${query}". ${yearInstruction}. ${typeInstruction}.
    
    TUGAS:
    1. Buat "synthesis" (tinjauan pustaka) yang formal, justify, bergaya akademik (Times New Roman 12pt style).
    2. WAJIB menyertakan sitasi dalam teks menggunakan format angka dalam kurung siku, misal: [1], [2], dst.
    3. Pastikan angka sitasi di dalam teks "synthesis" merujuk tepat pada objek di dalam array "citations".
    4. Berikan 3-5 buku/ebook asli yang benar-benar ada di database atau web.`,
    config
  });
  console.log("Raw response:", response.text) 


  try {
    const data = JSON.parse(response.text || '{}') as SearchResult;
    //REVALLIDATE THE UOTPUT SOURCE TYPE 
    if (typeFilter !== "all") {
      const expected = typeFilter === "e-book" ? "ebook" : typeFilter; // journal/article
      const ok = (data.citations || []).every(c => (c as any).type === expected);
      if (!ok) throw new Error(`Hasil tidak sesuai filter (${typeFilter}). Coba ulangi atau spesifikkan query.`);
    }
    data.groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    data.citations = data.citations.map(c => ({
      ...c,
      imageUrl: `https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300&h=400&q=${encodeURIComponent(c.imageUrl || c.title)}`
    }));
    return data;
  } catch (error) {
    throw new Error("Gagal menyusun data. Pastikan query spesifik.");
  }
};

export const sendChatMessage = async (history: ChatMessage[], message: string): Promise<string> => {
  console.log("Chat history:", history);
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
  systemInstruction : `Anda adalah BiblioBot, asisten riset yang ramah. 

TUGAS UTAMA:
- Bantu pengguna dengan pertanyaan seputar referensi
- Jelaskan cara sitasi yang benar
- Jawab topik akademik dengan singkat dan akurat

FORMATTING RULES - WAJIB IKUTI:
1. **Bold untuk judul utama** - gunakan **text**
2. ### Headers untuk section - gunakan ### text
3. Bullet points untuk list - gunakan - text
4. *Italic untuk penekanan* - gunakan *text*
5. Numbered list untuk urutan - gunakan 1. 2. 3.
6. Code blocks untuk contoh - gunakan \`\`\`text\`\`\`
7. Links dalam format [text](url)

CONTOH FORMAT RESPONS:
### Judul Topik
Paragraf penjelasan singkat di sini.

**Poin Penting:**
- Item 1
- Item 2
- Item 3

Selalu respond dengan Markdown yang rapi dan terstruktur.`
      
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "Maaf, saya tidak bisa merespons saat ini.";
};
