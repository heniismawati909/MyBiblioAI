
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const searchCitations = async (
  query: string, 
  yearFilter: string, 
  isDeepResearch: boolean
): Promise<SearchResult> => {
  const currentYear = new Date().getFullYear();
  let yearInstruction = "";
  
  if (yearFilter === "5") {
    yearInstruction = `Utamakan referensi 5 tahun terakhir (${currentYear - 5}-${currentYear}).`;
  } else if (yearFilter === "10") {
    yearInstruction = `Utamakan referensi 10 tahun terakhir (${currentYear - 10}-${currentYear}).`;
  }

  const modelName = isDeepResearch ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  const config: any = {
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
              id: { type: Type.STRING, description: "Nomor urut sitasi, misal '1', '2'" },
              title: { type: Type.STRING },
              authors: { type: Type.ARRAY, items: { type: Type.STRING } },
              year: { type: Type.STRING },
              publisher: { type: Type.STRING },
              page: { type: Type.STRING },
              snippet: { type: Type.STRING },
              sourceUrl: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            },
            required: ["id", "title", "authors", "year", "page", "snippet", "sourceUrl"]
          }
        }
      },
      required: ["query", "synthesis", "citations"]
    }
  };

  if (isDeepResearch) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  } else {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Cari referensi akademik nyata untuk: "${query}". ${yearInstruction}
    
    TUGAS:
    1. Buat "synthesis" (tinjauan pustaka) yang formal, justify, bergaya akademik (Times New Roman 12pt style).
    2. WAJIB menyertakan sitasi dalam teks menggunakan format angka dalam kurung siku, misal: [1], [2], dst.
    3. Pastikan angka sitasi di dalam teks "synthesis" merujuk tepat pada objek di dalam array "citations".
    4. Berikan 3-5 buku/ebook asli yang benar-benar ada di database atau web.`,
    config
  });

  try {
    const data = JSON.parse(response.text || '{}') as SearchResult;
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
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "Anda adalah BiblioBot, asisten riset yang ramah. Bantu pengguna menjawab pertanyaan seputar referensi, cara sitasi, dan topik akademik lainnya secara singkat dan akurat."
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "Maaf, saya tidak bisa merespons saat ini.";
};
