"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Layout, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  Copy, 
  Check, 
  Upload, 
  X,
  Image as ImageIcon,
  Video,
  Film
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Meta Ads Objectives
const META_OBJECTIVES = [
  { id: "awareness", name: "Awareness", description: "Show your ads to people who are most likely to remember them." },
  { id: "traffic", name: "Traffic", description: "Send people to a destination, like your website, app, or Facebook event." },
  { id: "engagement", name: "Engagement", description: "Get more messages, video views, post engagement, Page likes or event responses." },
  { id: "leads", name: "Leads", description: "Collect leads for your business or brand." },
  { id: "app_promotion", name: "App Promotion", description: "Find new people to install your app and continue using it." },
  { id: "sales", name: "Sales", description: "Find people likely to purchase your product or service." },
];

const FORMAT_OPTIONS = ["Static Image", "Carousel", "Video", "Text Only"];

const IMAGE_FORMAT_OPTIONS = [
  { 
    name: "Static Image", 
    description: "Satu banner gambar beresolusi tinggi dengan penataan headline, benefit, & CTA di dalam gambar." 
  },
  { 
    name: "Carousel", 
    description: "Multi-slide 3-5 gambar berurutan untuk alur cerita produk, USP berantai, atau katalog benefit." 
  }
];

const VIDEO_FORMAT_OPTIONS = [
  { 
    name: "Short-Form Video (Reels / TikTok - 15-30s)", 
    description: "Video vertikal cepat dengan visual hook 3 detik pertama, tempo dinamis, & teks overlay." 
  },
  { 
    name: "Problem-Solution & Explainer (30-60s)", 
    description: "Video mengupas keresahan target audiens dan menghadirkan produk sebagai solusi konkrit." 
  },
  { 
    name: "UGC & Creator Testimonial Style", 
    description: "Gaya review autentik kreator dengan unboxing, demonstrasi pemakaian langsung, dan testimoni." 
  },
  { 
    name: "Product Showcase & Motion Ad", 
    description: "Fokus keindahan visual produk, fitur utama, penawaran promo, dan motion grafis." 
  }
];

const CTA_OPTIONS = [
  "Learn More",
  "Shop Now",
  "Sign Up",
  "Book Now",
  "Contact Us",
  "Get Offer",
  "Download",
  "Watch More",
  "Apply Now",
  "Subscribe"
];

const AB_VARIABLES = ["Format Konten", "Headline", "Copy", "CTA"];

type AdType = "image" | "video" | "ab_testing" | "normal";

interface AdBriefData {
  type: AdType;
  objective: string;
  productName: string;
  usp: string;
  benefit: string;
  features: string;
  audience: string;
  targeting: string;
  brandTone: string;
  previousCopy: string;
  contextProfileContent?: string;
  contextFileName?: string;
  format?: string;
  imageRatio?: string;
  cta?: string;
  abVariables?: string[];
  quantity: number;
}

const isImageFormat = (format?: string) => format === "Static Image" || format === "Carousel";

const needsRatio = (data: AdBriefData) => {
  if (data.type === "ab_testing" && data.abVariables?.includes("Format Konten")) {
    return true;
  }
  if (data.type === "image" || data.type === "video") {
    return true;
  }
  return isImageFormat(data.format) || data.format?.toLowerCase().includes("video");
};

// Step Components
const StepContainer = ({ 
  children, 
  title, 
  description, 
  step, 
  prevStep, 
  nextStep, 
  handleGenerate, 
  isGenerating, 
  data 
}: { 
  children: React.ReactNode; 
  title: string; 
  description?: string;
  step: number;
  prevStep: () => void;
  nextStep: () => void;
  handleGenerate: () => void;
  isGenerating: boolean;
  data: AdBriefData;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="w-full max-w-2xl mx-auto"
  >
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">{title}</h2>
      {description && <p className="text-zinc-500">{description}</p>}
    </div>
    <div className="space-y-6">
      {children}
    </div>
    <div className="mt-12 flex justify-between items-center border-t border-zinc-100 pt-8">
      {step > 1 && step < 12 && (
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-zinc-500 hover:text-brand transition-colors font-medium"
        >
          <ChevronLeft size={20} /> Back
        </button>
      )}
      <div className="flex-1" />
      {step < 11 && (
        <button
          onClick={nextStep}
          disabled={
            (step === 1 && !data.type) ||
            (step === 2 && !data.objective) ||
            (step === 3 && data.type === "ab_testing" && (!data.abVariables || data.abVariables.length === 0)) ||
            (step === 5 && (!data.productName || !data.usp || !data.benefit || !data.features)) ||
            (step === 6 && (!data.audience || !data.targeting)) ||
            (step === 7 && !data.brandTone) ||
            (step === 8 && !data.format) ||
            (step === 9 && !data.imageRatio) ||
            (step === 10 && data.type !== "ab_testing" && !data.cta)
          }
          className="bg-brand text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-brand-100"
        >
          Next <ChevronRight size={20} />
        </button>
      )}
          {step === 11 && (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-brand text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-dark transition-all flex items-center gap-2 shadow-lg shadow-brand-100"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={20} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              Generate Prompt <Sparkles size={20} />
            </>
          )}
        </button>
      )}
    </div>
  </motion.div>
);

export default function App() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AdBriefData>({
    type: "image",
    objective: "",
    productName: "",
    usp: "",
    benefit: "",
    features: "",
    audience: "",
    targeting: "",
    brandTone: "",
    previousCopy: "",
    contextProfileContent: "",
    contextFileName: "",
    format: "Static Image",
    imageRatio: "1:1",
    quantity: 1,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const nextStep = () => {
    setStep((currentStep) => {
      if (currentStep === 1) return 2;
      if (currentStep === 2) return data.type === "ab_testing" ? 3 : 4;
      if (currentStep === 3) return 4;
      if (currentStep === 4) return 5;
      if (currentStep === 5) return 6;
      if (currentStep === 6) return 7;
      if (currentStep === 7) {
        if (data.type === "ab_testing" && data.abVariables?.includes("Format Konten")) {
          return 9;
        }
        return 8;
      }
      if (currentStep === 8) {
        if (needsRatio(data)) {
          return 9;
        }
        if (data.type !== "ab_testing") return 10;
        return 11;
      }
      if (currentStep === 9) {
        if (data.type !== "ab_testing") return 10;
        return 11;
      }
      if (currentStep === 10) return 11;
      return currentStep + 1;
    });
  };

  const prevStep = () => {
    setStep((currentStep) => {
      if (currentStep === 12) return 11;
      if (currentStep === 11) {
        if (data.type !== "ab_testing") return 10;
        if (needsRatio(data)) return 9;
        if (!data.abVariables?.includes("Format Konten")) return 8;
        return 7;
      }
      if (currentStep === 10) {
        if (needsRatio(data)) return 9;
        return 8;
      }
      if (currentStep === 9) {
        if (data.type === "ab_testing" && data.abVariables?.includes("Format Konten")) {
          return 7;
        }
        return 8;
      }
      if (currentStep === 8) return 7;
      if (currentStep === 7) return 6;
      if (currentStep === 6) return 5;
      if (currentStep === 5) return 4;
      if (currentStep === 4) return data.type === "ab_testing" ? 3 : 2;
      if (currentStep === 3) return 2;
      if (currentStep === 2) return 1;
      return currentStep - 1;
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    let targetPersona = "";
    let specificRequirements = "";
    let outputFormatRequest = "";

    const formatName = data.format || (data.type === "ab_testing" && data.abVariables?.includes("Format Konten") ? "A/B Testing 3 Format (Static Image, Video, Carousel)" : data.type === "video" ? "Video Meta Ads" : "Static Image Meta Ads");
    const ratioText = data.imageRatio ? ` (Rasio: ${data.imageRatio})` : "";
    const fullFormatString = `${formatName}${ratioText}`;

    const isImageVisual = data.type === "image" || isImageFormat(data.format) || (data.type === "ab_testing" && data.abVariables?.includes("Format Konten"));
    const imageTextOverlayInstruction = isImageVisual
      ? `\n- SYARAT MUTLAK VISUAL GAMBAR (${data.format || "Static Image / Carousel"}): Gambar/visual TIDAK BOLEH POLOSAN (bukan sekadar foto/gambar produk biasa). Harus dirancang sebagai Desain Banner/Poster Iklan Kreatif yang memiliki ELEMEN TEKS OVERLAY DI DALAM GAMBAR (seperti Headline Teks di dalam gambar, Sub-headline, Badge USP/Promo/Diskon, dan Tombol/Teks CTA Visual) dengan Rasio Gambar ${data.imageRatio || "1:1"}.`
      : "";

    if (data.type === "ab_testing" && data.abVariables && data.abVariables.length > 0) {
      const variable = data.abVariables[0];
      switch (variable) {
        case "Format Konten":
          targetPersona = "Bertindak sebagai Creative Director, Visual Content Strategist, dan Pengarah Visual Meta Ads berpengalaman.";
          specificRequirements = `
- FOKUS UTAMA: Sudut pandang (POV) pembuatan visual/desain/gambar/video, BUKAN penulisan body copy/caption panjang.
- FORMAT KONTEN: A/B Testing 3 Format Kreatif (Static Image, Video, Carousel).
- RASIO GAMBAR UNTUK STATIC IMAGE & CAROUSEL: ${data.imageRatio || "1:1"}.
- PENTING (ATURAN GAMBAR - TIDAK BOLEH POLOSAN): Visual gambar/slide TIDAK BOLEH hanya berupa foto polosan tanpa teks. Setiap konsep gambar HARUS dirancang sebagai Desain Banner/Poster Iklan Kreatif lengkap dengan ELEMEN TEKS OVERLAY DI DALAM GAMBAR (Headline Teks di dalam gambar, Sub-headline, Badge USP/Promo, & Tombol CTA Visual).
- Minta LLM untuk memposisikan dirinya sebagai pengarah kreatif dan menghasilkan 3 konsep pengarahan visual (Visual Directions/Concepts) yang berbeda berdasarkan pesan & produk yang sama, yaitu:
  1. Opsi Static Image: Detail konsep desain banner iklan (Rasio ${data.imageRatio || "1:1"}), hierarki tata letak teks overlay di dalam gambar (Headline, Subhead, Badge USP, CTA Button), mood warna, serta prompt generator gambar (seperti Midjourney/DALL-E) yang menginstruksikan desain ad poster dengan text overlay dan parameter rasio --ar ${data.imageRatio === "4:5" ? "4:5" : "1:1"}.
  2. Opsi Video (Reels/Shorts/TikTok): Konsep video 15-30 detik, storyboard visual per adegan/scene, hook visual 3 detik pertama, instruksi teks overlay di video (on-screen text), serta petunjuk gerakan kamera & peragaan produk.
  3. Opsi Carousel: Konsep alur cerita visual 3-5 slide (Rasio ${data.imageRatio || "1:1"}), detail tata letak teks overlay & komposisi gambar per slide, serta kontinuitas grafis & teks antar slide.
- PENTING: Seluruh instruksi harus berfokus pada pengarahan visual, desain grafis iklan lengkap teks overlay, dan konsep video!`;
          outputFormatRequest = `3 Pengarahan Visual Lengkap (1. Static Image Visual Concept & Prompt [Desain Banner + Teks Overlay, Rasio ${data.imageRatio || "1:1"}], 2. Video Storyboard & Visual Direction, 3. Carousel Slide-by-Slide Visual Concept [Desain Slide + Teks Overlay, Rasio ${data.imageRatio || "1:1"}]).`;
          break;

        case "Headline":
          targetPersona = "Bertindak sebagai Direct Response Copywriter & Meta Ads Hook Specialist.";
          specificRequirements = `
- FOKUS UTAMA: Pengujian A/B untuk Headline/Hook.
- FORMAT KONTEN: ${fullFormatString}.${imageTextOverlayInstruction}
- Minta LLM untuk menghasilkan 3 opsi Headline/Hook yang berbeda dengan sudut pandang (angle) psikologi yang berbeda (misal: Hook Rasa Ingin Tahu, Hook Benefit Langsung, dan Hook Problem-Solution) untuk produk yang sama.
- Format visual (${fullFormatString}), body copy, dan CTA dijaga tetap konsisten/seragam.`;
          outputFormatRequest = `3 Opsi Headline/Hook yang berbeda beserta penjelasan sudut pandang psikologi di balik setiap headline (Format Konten: ${fullFormatString}).`;
          break;

        case "Copy":
          targetPersona = "Bertindak sebagai Senior Meta Ads Direct Response Copywriter.";
          specificRequirements = `
- FOKUS UTAMA: Pengujian A/B untuk Body Copy / Primary Text.
- FORMAT KONTEN: ${fullFormatString}.${imageTextOverlayInstruction}
- Minta LLM untuk menghasilkan 3 opsi Body Copy (Primary Text) yang berbeda menggunakan 3 kerangka copywriting yang berbeda (misal: PAS - Problem Agitate Solution, AIDA - Attention Interest Desire Action, dan Storytelling/Testimonial) untuk produk yang sama.
- Format visual (${fullFormatString}), headline, dan CTA dijaga tetap konsisten/seragam.`;
          outputFormatRequest = `3 Opsi Primary Text / Body Copy lengkap dengan formula copywriting yang digunakan pada masing-masing opsi (Format Konten: ${fullFormatString}).`;
          break;

        case "CTA":
          targetPersona = "Bertindak sebagai Conversion Rate Optimizer & Meta Ads Copywriter.";
          specificRequirements = `
- FOKUS UTAMA: Pengujian A/B untuk Call to Action (CTA) dan penawaran.
- FORMAT KONTEN: ${fullFormatString}.${imageTextOverlayInstruction}
- Minta LLM untuk menghasilkan 3 opsi Call to Action (CTA) dan teks pemicu konversi yang berbeda (misal: Direct Offer CTA, Urgency/Scarcity CTA, dan Low-Friction Curiosity CTA) untuk produk yang sama.
- Format visual (${fullFormatString}), headline, dan body copy dijaga tetap konsisten/seragam.`;
          outputFormatRequest = `3 Opsi Call to Action (CTA) & Teks Penutup beserta penjelasan pemicu psikologi konversinya (Format Konten: ${fullFormatString}).`;
          break;

        default:
          targetPersona = "Bertindak sebagai Senior Meta Ads Strategist & Copywriter.";
          specificRequirements = `
- Minta LLM untuk membuat variasi konten A/B testing berdasarkan variabel yang dipilih.
- FORMAT KONTEN WAJIB: ${fullFormatString}.${imageTextOverlayInstruction}`;
          outputFormatRequest = `Variasi A/B testing yang terstruktur (Format Konten: ${fullFormatString}).`;
          break;
      }
    } else if (data.type === "video") {
      // VIDEO AD CONTENT
      targetPersona = "Bertindak sebagai Senior Creative Director, Direct-Response Video Ads Strategist, dan Video Scriptwriter berpengalaman untuk Meta Ads (Reels, TikTok, & Feeds).";
      specificRequirements = `
- FOKUS UTAMA: Pembuatan ${data.quantity} Konsep Video Iklan Meta Ads yang dirancang khusus untuk menghentikan scroll (scroll-stopping), retensi tinggi (high watch-time), dan memicu konversi pembelian/lead.
- FORMAT & GAYA VIDEO: ${fullFormatString} (Rasio Video: ${data.imageRatio || "9:16"}).
- STRUKTUR LENGKAP YANG HARUS DIHASILKAN UNTUK SETIAP VARIASI VIDEO:
  1. Hook Visual & Audio 3 Detik Pertama: Pola interupsi visual yang mengejutkan/menarik mata + Hook verbal yang menusuk masalah spesifik audiens.
  2. Storyboard Adegan per Adegan (Scene-by-Scene Breakdown):
     - Scene 1 (0-3 detik): The Scroll-Stopper Hook
     - Scene 2 (3-10 detik): Problem Agitation (Penggambaran masalah nyata yang dialami audiens)
     - Scene 3 (10-20 detik): Product Reveal & Solution (Demo pemakaian & keunggulan produk)
     - Scene 4 (20-25 detik): Benefit & Social Proof (USP pembeda + alasan harus percaya)
     - Scene 5 (25-30+ detik): Call to Action & Urgency (Instruksi tindakan yang tegas)
  3. Visual & Camera Direction: Petunjuk sudut kamera, framing, peragaan talent/produk, pencahayaan, dan transisi antar-adegan.
  4. On-Screen Text Overlay: Teks tebal yang wajib dimunculkan di layar video untuk audiens yang menonton dalam keadaan bisu (muted).
  5. Voiceover / Dialogue Script: Skrip narasi percakapan Bahasa Indonesia yang natural, energik, dan persuasif.
  6. Meta Ads Copywriting: Headline singkat penunjang video, Primary Text / Caption postingan, dan Tombol CTA (${data.cta || "Shop Now"}).`;
      outputFormatRequest = `${data.quantity} Paket Konsep Video Iklan Meta Ads Lengkap (${fullFormatString}: Visual Hook 3 Detik, Storyboard Adegan demi Adegan, Visual & Camera Direction, On-Screen Text, Skrip Narasi/Voiceover, Caption/Primary Text, dan CTA).`;
    } else if (data.type === "image") {
      // IMAGE AD CONTENT
      targetPersona = "Bertindak sebagai Creative Director, Visual Graphic Content Strategist, dan Direct-Response Copywriter berpengalaman untuk Meta Ads.";
      specificRequirements = `
- FOKUS UTAMA: Pembuatan ${data.quantity} variasi iklan Meta Ads berbasis gambar (${fullFormatString}) yang mengutamakan desain banner kreatif berperforma tinggi.
- FORMAT KONTEN: ${fullFormatString}.${imageTextOverlayInstruction}
- ATURAN MUTLAK VISUAL DESAIN BANNER (JANGAN HANYA FOTO POLOSAN):
  Visual HARUS dirancang sebagai Desain Banner/Poster Iklan Kreatif lengkap dengan hierarki ELEMEN TEKS OVERLAY DI DALAM GAMBAR (Headline Teks di dalam gambar, Sub-headline/Poin Benefit, Badge USP/Promo, dan Tombol CTA Visual).
- Sertakan Prompt Generator Gambar AI (seperti Midjourney / DALL-E) dengan parameter rasio --ar ${data.imageRatio === "4:5" ? "4:5" : "1:1"} yang menginstruksikan pembuatan ad design banner poster lengkap dengan penempatan teks banner.
- Sertakan kombinasi: Hook/Headline Meta Ads, Primary Text (caption persuasif), Detail Tata Letak Desain Visual Banner (Layout, visual hierarchy, text placement), Prompt Gambar AI, dan Tombol CTA (${data.cta || "Learn More"}).`;
      outputFormatRequest = `${data.quantity} Paket Variasi Iklan Gambar Lengkap (${fullFormatString}: Headline Meta, Primary Text, Panduan Desain Banner & Teks Overlay, AI Image Prompt, dan CTA).`;
    } else {
      // Fallback
      targetPersona = "Bertindak sebagai Senior Meta Ads Strategist & Copywriter.";
      specificRequirements = `
- Minta LLM untuk membuat ${data.quantity} variasi iklan Meta Ads yang lengkap dan siap pakai.
- FORMAT KONTEN WAJIB: ${fullFormatString}.${imageTextOverlayInstruction}
- Sertakan kombinasi Hook/Headline, Primary Text, Visual Direction (penjelasan visual/gambar/video yang sesuai dengan format ${fullFormatString}), dan CTA.`;
      outputFormatRequest = `${data.quantity} Paket Variasi Iklan Lengkap (${fullFormatString}: Headline, Primary Text, Visual Direction, dan CTA).`;
    }

    const prompt = `
      You are an expert Prompt Engineer and Meta Ads Strategist. 
      Your task is to generate a high-converting "Master Prompt" written in Indonesian (Bahasa Indonesia) that the user can copy and paste into other LLMs (like ChatGPT, Claude, Gemini, or Midjourney/image generators).

      CRITICAL RULES FOR THE MASTER PROMPT YOU GENERATE:
      - The generated Master Prompt MUST strictly adopt the requested Persona and POV.
      - The generated Master Prompt MUST EXPLICITLY state and enforce the user's selected Content Format ("${formatName}") ${data.imageRatio ? `and Aspect Ratio ("${data.imageRatio}")` : ""} in its specifications section and prompt instructions.
      - ATURAN MUTLAK KONTEN GAMBAR (JANGAN POLOSAN): Untuk setiap format berbasis gambar (Static Image atau Carousel), pengarahan visual dan prompt generator gambar (Midjourney/DALL-E) TIDAK BOLEH HANYA FOTO POLOSAN/STOK GAMBAR biasa. Visual HARUS dirancang sebagai Desain Banner/Poster Iklan Kreatif lengkap dengan ELEMEN TEKS OVERLAY DI DALAM GAMBAR (termasuk Headline Teks di dalam gambar, Sub-headline, Badge USP/Promo/Diskon, dan Tombol/Teks CTA Visual) dengan parameter rasio --ar ${data.imageRatio === "4:5" ? "4:5" : "1:1"}.
      - Adhere strictly to the requested focus requirements below.

      MASTER PROMPT SPECIFICATIONS:
      - Target Persona to set in the generated prompt: ${targetPersona}
      - Specific Focus & Requirements: 
        ${specificRequirements}
      - Requested Output Format in the generated prompt: ${outputFormatRequest}

      USER CONTEXT TO INCLUDE IN THE MASTER PROMPT:
      - Tipe Konten: ${data.type === "image" ? "Konten Gambar (Image Ad)" : data.type === "video" ? "Konten Video (Video Ad)" : data.type === "ab_testing" ? "A/B Testing" : "Konten Iklan"}
      - Objective Meta Ads: ${data.objective}
      - Nama Produk: ${data.productName}
      - USP (Unique Selling Point): ${data.usp}
      - Manfaat Produk (Benefit): ${data.benefit}
      - Fitur Produk (Features): ${data.features}
      - Target Audience: ${data.audience}
      - Detail Targeting: ${data.targeting}
      - Tone / Style Brand: ${data.brandTone}
      - Gaya Bahasa / Contoh Copy Sebelumnya: ${data.previousCopy || "Tidak ada"}
      - Informasi / Dokumen Profil Konteks: ${data.contextProfileContent || "Tidak ada"}
      - Format Konten: ${formatName}
      ${data.imageRatio ? `- Rasio Konten (Aspect Ratio): ${data.imageRatio}` : ""}
      ${data.cta ? `- Call to Action Dasar: ${data.cta}` : ""}

      OUTPUT FORMAT INSTRUCTIONS FOR YOU (GEMINI):
      - Output ONLY the Master Prompt text in Indonesian (Bahasa Indonesia).
      - Do NOT add any introductory or concluding pleasantries (e.g., "Berikut adalah prompt Anda..."). Start immediately with the prompt text itself so it is 100% clean and copy-paste ready.
    `;

    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const rawText = await res.text();
      let dataRes: any = {};
      try {
        dataRes = JSON.parse(rawText);
      } catch {
        throw new Error(
          res.status === 503
            ? "Layanan AI sedang mengalami lonjakan trafik yang tinggi. Mohon coba kembali dalam beberapa saat."
            : `Server merespons dengan kode status ${res.status}. Silakan coba lagi.`
        );
      }

      if (!res.ok) {
        throw new Error(dataRes.error || `Server responded with status ${res.status}`);
      }

      setResult(dataRes.text || "Gagal menghasilkan prompt.");
      setStep(12); // Result step
    } catch (error: any) {
      console.error("Generation error:", error);
      alert(`Gagal menghasilkan prompt: ${error?.message || "Terjadi kesalahan pada server. Silakan coba lagi."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setStep(1);
    setData({
      type: "image",
      objective: "",
      productName: "",
      usp: "",
      benefit: "",
      features: "",
      audience: "",
      targeting: "",
      brandTone: "",
      previousCopy: "",
      contextProfileContent: "",
      contextFileName: "",
      format: "Static Image",
      imageRatio: "1:1",
      quantity: 1,
    });
    setResult(null);
  };

  // Step skipping logic
  useEffect(() => {
    if (step === 3 && data.type !== "ab_testing") {
      setStep(4);
    }
    if (step === 8 && data.type === "ab_testing" && data.abVariables?.includes("Format Konten")) {
      setStep(9);
    }
    if (step === 10 && data.type === "ab_testing") {
      setStep(11);
    }
  }, [step, data.type, data.abVariables]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Header */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <Image src="/logo-bolehbelajar.png" alt="Boleh Belajar" width={679} height={172} priority className="h-8 w-auto" />
            <div className="h-6 w-px bg-zinc-200" />
            <h1 className="font-bold text-xl tracking-tight text-brand">AdBrief</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
            <span className={step >= 1 ? "text-brand" : ""}>Setup</span>
            <ChevronRight size={14} />
            <span className={step >= 5 ? "text-brand" : ""}>Content</span>
            <ChevronRight size={14} />
            <span className={step >= 12 ? "text-brand" : ""}>Results</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {/* STEP 1: Type Selection */}
          {step === 1 && (
            <StepContainer 
              title="What are we building today?" 
              description="Pilih jenis format materi iklan Meta Ads yang ingin dibuat."
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Image */}
                <button
                  type="button"
                  onClick={() => { 
                    setData({ 
                      ...data, 
                      type: "image", 
                      format: "Static Image", 
                      imageRatio: data.imageRatio === "9:16" ? "1:1" : (data.imageRatio || "1:1") 
                    }); 
                    nextStep(); 
                  }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all group flex flex-col justify-between ${
                    data.type === "image" 
                      ? "border-brand bg-brand-50 shadow-md shadow-brand-100/50" 
                      : "border-zinc-100 bg-white hover:border-brand-200 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      data.type === "image" 
                        ? "bg-brand text-white" 
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-brand-50 group-hover:text-brand"
                    }`}>
                      <ImageIcon size={24} />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-zinc-900">Image</h3>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 group-hover:bg-brand-50 group-hover:text-brand">Gambar</span>
                    </div>
                    <p className="text-xs font-semibold text-brand mb-2">Static Image & Carousel</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">Desain banner iklan kreatif lengkap dengan teks overlay, hierarki visual, & AI image prompt.</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-400 group-hover:text-brand">
                    <span>Single / Carousel</span>
                    <ChevronRight size={16} />
                  </div>
                </button>

                {/* 2. Video */}
                <button
                  type="button"
                  onClick={() => { 
                    setData({ 
                      ...data, 
                      type: "video", 
                      format: "Short-Form Video (Reels / TikTok - 15-30s)", 
                      imageRatio: data.imageRatio || "9:16" 
                    }); 
                    nextStep(); 
                  }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all group flex flex-col justify-between ${
                    data.type === "video" 
                      ? "border-brand bg-brand-50 shadow-md shadow-brand-100/50" 
                      : "border-zinc-100 bg-white hover:border-brand-200 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      data.type === "video" 
                        ? "bg-brand text-white" 
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-brand-50 group-hover:text-brand"
                    }`}>
                      <Video size={24} />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-zinc-900">Video</h3>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 group-hover:bg-brand-50 group-hover:text-brand">Video Ad</span>
                    </div>
                    <p className="text-xs font-semibold text-brand mb-2">Reels, TikTok & Feeds</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">Konsep video dengan hook 3 detik, storyboard per adegan, on-screen text, & skrip voiceover.</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-400 group-hover:text-brand">
                    <span>Storyboard & Skrip</span>
                    <ChevronRight size={16} />
                  </div>
                </button>

                {/* 3. A/B Testing */}
                <button
                  type="button"
                  onClick={() => { 
                    setData({ 
                      ...data, 
                      type: "ab_testing",
                      format: undefined 
                    }); 
                    nextStep(); 
                  }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all group flex flex-col justify-between ${
                    data.type === "ab_testing" 
                      ? "border-brand bg-brand-50 shadow-md shadow-brand-100/50" 
                      : "border-zinc-100 bg-white hover:border-brand-200 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      data.type === "ab_testing" 
                        ? "bg-brand text-white" 
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-brand-50 group-hover:text-brand"
                    }`}>
                      <Layers size={24} />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-zinc-900">A/B Testing</h3>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 group-hover:bg-brand-50 group-hover:text-brand">Testing</span>
                    </div>
                    <p className="text-xs font-semibold text-brand mb-2">Multi-Variable Test</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">Uji variabel format konten, headline, body copy, atau call-to-action untuk menemukan winning ad.</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-400 group-hover:text-brand">
                    <span>3 Variasi terarah</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              </div>
            </StepContainer>
          )}

          {/* STEP 2: Objective Selection */}
          {step === 2 && (
            <StepContainer 
              title="Campaign Objective" 
              description="Select the Meta Ads objective that matches your goal."
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="grid grid-cols-1 gap-3">
                {META_OBJECTIVES.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setData({ ...data, objective: obj.name })}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${data.objective === obj.name ? "border-brand bg-brand-50" : "border-zinc-100 bg-white hover:border-brand-200"}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${data.objective === obj.name ? "bg-brand text-white" : "bg-zinc-100 text-zinc-500"}`}>
                      <Target size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{obj.name}</h4>
                      <p className="text-xs text-zinc-500">{obj.description}</p>
                    </div>
                    {data.objective === obj.name && <CheckCircle2 size={20} className="ml-auto text-brand" />}
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* STEP 3: A/B Variables (Conditional) */}
          {step === 3 && data.type === "ab_testing" && (
            <StepContainer 
              title="A/B Testing Variables" 
              description="What variables do you want to test?"
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="grid grid-cols-2 gap-3">
                {AB_VARIABLES.map((v) => {
                  const isSelected = data.abVariables?.includes(v);
                  const isAnySelected = data.abVariables && data.abVariables.length > 0;
                  const isDisabled = isAnySelected && !isSelected;

                  return (
                    <button
                      key={v}
                      disabled={isDisabled}
                      onClick={() => {
                        const current = data.abVariables || [];
                        const next = current.includes(v) ? [] : [v];
                        setData({ ...data, abVariables: next });
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        isSelected 
                          ? "border-brand bg-brand-50" 
                          : "border-zinc-100 bg-white hover:border-brand-200"
                      } ${isDisabled ? "opacity-40 cursor-not-allowed grayscale-[0.5]" : ""}`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? "bg-brand border-brand text-white" 
                          : "border-zinc-300"
                      }`}>
                        {isSelected && <Check size={14} />}
                      </div>
                      <span className={`font-medium text-sm ${isDisabled ? "text-zinc-400" : "text-zinc-700"}`}>{v}</span>
                    </button>
                  );
                })}
              </div>
            </StepContainer>
          )}

          {/* STEP 4: Context Profile (New) */}
          {step === 4 && (
            <StepContainer 
              title="Context Profile" 
              description="Upload a file or paste text to give AI more context about your brand/product."
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${data.contextFileName ? "border-emerald-200 bg-emerald-50" : "border-zinc-200 bg-white hover:border-brand/30"}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setData({ 
                          ...data, 
                          contextProfileContent: ev.target?.result as string,
                          contextFileName: file.name
                        });
                      };
                      reader.readAsText(file);
                    }
                  }}
                >
                  {data.contextFileName ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="font-bold text-emerald-900 mb-1">{data.contextFileName}</p>
                      <button 
                        onClick={() => setData({ ...data, contextProfileContent: "", contextFileName: "" })}
                        className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        <X size={14} /> Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-xl flex items-center justify-center mb-4">
                        <Upload size={24} />
                      </div>
                      <p className="font-bold text-zinc-900 mb-1">Drag and drop your file here</p>
                      <p className="text-sm text-zinc-500 mb-4">Support .txt, .md, or any text-based file</p>
                      <label className="bg-white border border-zinc-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-50 cursor-pointer transition-colors shadow-sm">
                        Browse Files
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".txt,.md,.json,.csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setData({ 
                                  ...data, 
                                  contextProfileContent: ev.target?.result as string,
                                  contextFileName: file.name
                                });
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#F9F9F9] px-2 text-zinc-400 font-semibold tracking-wider">Or paste manually</span>
                  </div>
                </div>

                <div>
                  <textarea
                    value={data.contextProfileContent}
                    onChange={(e) => setData({ ...data, contextProfileContent: e.target.value })}
                    placeholder="Paste your brand profile, product documentation, or any other context here..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none bg-white"
                  />
                </div>
              </div>
            </StepContainer>
          )}

          {/* STEP 5: Product & USP */}
          {step === 5 && (
            <StepContainer 
              title="Product Details" 
              description="Tell us about your product and what makes it special."
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={data.productName}
                    onChange={(e) => setData({ ...data, productName: e.target.value })}
                    placeholder="e.g. Glowing Skin Serum"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Unique Selling Point (USP)</label>
                  <textarea
                    value={data.usp}
                    onChange={(e) => setData({ ...data, usp: e.target.value })}
                    placeholder="What makes your product better than competitors?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Benefit</label>
                    <textarea
                      value={data.benefit}
                      onChange={(e) => setData({ ...data, benefit: e.target.value })}
                      placeholder="What value does the user get?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Features</label>
                    <textarea
                      value={data.features}
                      onChange={(e) => setData({ ...data, features: e.target.value })}
                      placeholder="Key technical aspects or specs..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </StepContainer>
          )}

          {/* STEP 6: Audience & Targeting */}
          {step === 6 && (
            <StepContainer 
              title="Audience & Targeting" 
              description="Who are we trying to reach?"
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={data.audience}
                    onChange={(e) => setData({ ...data, audience: e.target.value })}
                    placeholder="e.g. Women aged 25-45 interested in skincare"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Detailed Targeting</label>
                  <textarea
                    value={data.targeting}
                    onChange={(e) => setData({ ...data, targeting: e.target.value })}
                    placeholder="Interests, behaviors, or demographics..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </StepContainer>
          )}

          {/* STEP 7: Brand Tone */}
          {step === 7 && (
            <StepContainer 
              title="Brand Tone" 
              description="How should your brand sound?"
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Describe your brand voice</label>
                  <textarea
                    value={data.brandTone}
                    onChange={(e) => setData({ ...data, brandTone: e.target.value })}
                    placeholder="e.g. Professional, witty, empathetic, energetic..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Previous Copy (Optional)</label>
                  <textarea
                    value={data.previousCopy}
                    onChange={(e) => setData({ ...data, previousCopy: e.target.value })}
                    placeholder="Paste your existing ad copy here to help AI replicate your style..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </StepContainer>
          )}

          {/* STEP 8: Format Selection */}
          {step === 8 && (data.type === "image" || data.type === "video" || (data.type === "ab_testing" && !data.abVariables?.includes("Format Konten")) || data.type === "normal") && (
            <StepContainer 
              title={data.type === "video" ? "Video Style & Format" : data.type === "image" ? "Format Iklan Gambar" : "Content Format"} 
              description={data.type === "video" ? "Pilih gaya konsep dan format video yang diinginkan." : data.type === "image" ? "Pilih jenis format materi iklan gambar." : "Pilih format materi iklan Meta Ads."}
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              {data.type === "image" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {IMAGE_FORMAT_OPTIONS.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setData({ ...data, format: item.name })}
                      className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        data.format === item.name 
                          ? "border-brand bg-brand-50 text-brand shadow-sm" 
                          : "border-zinc-100 bg-white hover:border-brand-200 text-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            data.format === item.name ? "bg-brand text-white" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            <ImageIcon size={20} />
                          </div>
                          {data.format === item.name && <CheckCircle2 size={20} className="text-brand" />}
                        </div>
                        <h4 className="font-bold text-base mb-1 text-zinc-900">{item.name}</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : data.type === "video" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VIDEO_FORMAT_OPTIONS.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setData({ ...data, format: item.name })}
                      className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        data.format === item.name 
                          ? "border-brand bg-brand-50 text-brand shadow-sm" 
                          : "border-zinc-100 bg-white hover:border-brand-200 text-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            data.format === item.name ? "bg-brand text-white" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            <Video size={20} />
                          </div>
                          {data.format === item.name && <CheckCircle2 size={20} className="text-brand" />}
                        </div>
                        <h4 className="font-bold text-sm mb-1 text-zinc-900">{item.name}</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {FORMAT_OPTIONS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setData({ ...data, format: f })}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${data.format === f ? "border-brand bg-brand-50" : "border-zinc-100 bg-white hover:border-brand-200"}`}
                    >
                      <Layout size={18} className={data.format === f ? "text-brand" : "text-zinc-400"} />
                      <span className="font-medium text-sm">{f}</span>
                    </button>
                  ))}
                </div>
              )}
            </StepContainer>
          )}

          {/* STEP 9: Rasio (Aspect Ratio) */}
          {step === 9 && (
            <StepContainer 
              title={data.type === "video" ? "Rasio Video (Aspect Ratio)" : "Rasio Gambar (Aspect Ratio)"} 
              description={data.type === "video" ? "Pilih rasio dimensi video untuk penempatan Meta Ads Anda." : "Pilih rasio dimensi gambar atau carousel untuk iklan Anda."}
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              {data.type === "video" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setData({ ...data, imageRatio: "9:16" })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-48 ${
                      data.imageRatio === "9:16" 
                        ? "border-brand bg-brand-50 text-brand shadow-sm" 
                        : "border-zinc-100 bg-white hover:border-brand-200 text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <div className="w-5 h-8 border-2 border-current rounded-sm flex items-center justify-center text-[8px] font-bold">
                          9:16
                        </div>
                      </div>
                      {data.imageRatio === "9:16" && (
                        <CheckCircle2 size={20} className="text-brand" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-sm">9:16 (Vertical)</h3>
                        <span className="text-[10px] bg-brand-accent/10 text-brand-accent font-bold px-1.5 py-0.5 rounded">Populer</span>
                      </div>
                      <p className="text-xs text-zinc-500">Instagram Reels, Stories, TikTok, & Shorts.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setData({ ...data, imageRatio: "4:5" })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-48 ${
                      data.imageRatio === "4:5" 
                        ? "border-brand bg-brand-50 text-brand shadow-sm" 
                        : "border-zinc-100 bg-white hover:border-brand-200 text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <div className="w-5 h-7 border-2 border-current rounded-sm flex items-center justify-center text-[9px] font-bold">
                          4:5
                        </div>
                      </div>
                      {data.imageRatio === "4:5" && (
                        <CheckCircle2 size={20} className="text-brand" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1">4:5 (Feed Video)</h3>
                      <p className="text-xs text-zinc-500">Format potret optimal untuk feed mobile Facebook & IG.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setData({ ...data, imageRatio: "1:1" })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-48 ${
                      data.imageRatio === "1:1" 
                        ? "border-brand bg-brand-50 text-brand shadow-sm" 
                        : "border-zinc-100 bg-white hover:border-brand-200 text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <div className="w-6 h-6 border-2 border-current rounded-sm flex items-center justify-center text-[10px] font-bold">
                          1:1
                        </div>
                      </div>
                      {data.imageRatio === "1:1" && (
                        <CheckCircle2 size={20} className="text-brand" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1">1:1 (Square Feed)</h3>
                      <p className="text-xs text-zinc-500">Format persegi universal untuk Feed Desktop & Mobile.</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setData({ ...data, imageRatio: "1:1" })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-44 ${
                      data.imageRatio === "1:1" 
                        ? "border-brand bg-brand-50 text-brand shadow-sm" 
                        : "border-zinc-100 bg-white hover:border-brand-200 text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <div className="w-6 h-6 border-2 border-current rounded-sm flex items-center justify-center text-[10px] font-bold">
                          1:1
                        </div>
                      </div>
                      {data.imageRatio === "1:1" && (
                        <CheckCircle2 size={20} className="text-brand" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1">Rasio 1:1 (Square)</h3>
                      <p className="text-xs text-zinc-500">Format persegi standar untuk Feed Instagram, Facebook, & Post.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setData({ ...data, imageRatio: "4:5" })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-44 ${
                      data.imageRatio === "4:5" 
                        ? "border-brand bg-brand-50 text-brand shadow-sm" 
                        : "border-zinc-100 bg-white hover:border-brand-200 text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <div className="w-5 h-7 border-2 border-current rounded-sm flex items-center justify-center text-[9px] font-bold">
                          4:5
                        </div>
                      </div>
                      {data.imageRatio === "4:5" && (
                        <CheckCircle2 size={20} className="text-brand" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1">Rasio 4:5 (Vertical)</h3>
                      <p className="text-xs text-zinc-500">Format potret vertikal optimal untuk Feed Instagram & Meta Ads Mobile.</p>
                    </div>
                  </button>
                </div>
              )}
            </StepContainer>
          )}

          {/* STEP 10: CTA (For Non-A/B Testing) */}
          {step === 10 && data.type !== "ab_testing" && (
            <StepContainer 
              title="Call to Action" 
              description="Pilih rekomendasi CTA untuk materi iklan Anda."
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CTA_OPTIONS.map((cta) => (
                  <button
                    key={cta}
                    onClick={() => setData({ ...data, cta })}
                    className={`p-3 rounded-xl border-2 text-center transition-all text-sm font-medium ${data.cta === cta ? "border-brand bg-brand-50 text-brand" : "border-zinc-100 bg-white hover:border-brand-200"}`}
                  >
                    {cta}
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* STEP 11: Final Review & Quantity */}
          {step === 11 && (
            <StepContainer 
              title="Review & Generate" 
              description="Periksa kembali detail materi iklan dan tentukan jumlah variasi sebelum membuat prompt."
              step={step}
              prevStep={prevStep}
              nextStep={nextStep}
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
              data={data}
            >
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400 block mb-1">Tipe Iklan</span>
                      <span className="font-semibold capitalize">
                        {data.type === "image" ? "Image Ad" : data.type === "video" ? "Video Ad" : data.type === "ab_testing" ? "A/B Testing" : "Konten Iklan"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-1">Objective</span>
                      <span className="font-semibold">{data.objective}</span>
                    </div>
                    {data.contextFileName && (
                      <div className="col-span-2">
                        <span className="text-zinc-400 block mb-1">Context Profile</span>
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 w-fit">
                          <CheckCircle2 size={16} />
                          <span>{data.contextFileName}</span>
                        </div>
                      </div>
                    )}
                    {data.contextProfileContent && !data.contextFileName && (
                      <div className="col-span-2">
                        <span className="text-zinc-400 block mb-1">Context Profile (Manual)</span>
                        <span className="font-semibold text-xs line-clamp-2 italic">"{data.contextProfileContent}"</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-zinc-400 block mb-1">Product</span>
                      <span className="font-semibold">{data.productName}</span>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-zinc-400 block mb-1">Benefit</span>
                        <span className="font-semibold text-xs line-clamp-2">{data.benefit || "-"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block mb-1">Features</span>
                        <span className="font-semibold text-xs line-clamp-2">{data.features || "-"}</span>
                      </div>
                    </div>
                    {data.previousCopy && (
                      <div className="col-span-2">
                        <span className="text-zinc-400 block mb-1">Previous Copy Style</span>
                        <span className="font-semibold text-xs line-clamp-2 italic">"{data.previousCopy}"</span>
                      </div>
                    )}
                    {data.type !== "ab_testing" ? (
                      <>
                        <div>
                          <span className="text-zinc-400 block mb-1">Format</span>
                          <span className="font-semibold">{data.format}</span>
                        </div>
                        {needsRatio(data) && (
                          <div>
                            <span className="text-zinc-400 block mb-1">Rasio (Aspect Ratio)</span>
                            <span className="font-semibold">{data.imageRatio || "-"}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-zinc-400 block mb-1">CTA</span>
                          <span className="font-semibold">{data.cta}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-2">
                          <span className="text-zinc-400 block mb-1">Testing Variables</span>
                          <span className="font-semibold">{data.abVariables?.join(", ")}</span>
                        </div>
                        {data.format && (
                          <div>
                            <span className="text-zinc-400 block mb-1">Format</span>
                            <span className="font-semibold">{data.format}</span>
                          </div>
                        )}
                        {needsRatio(data) && (
                          <div>
                            <span className="text-zinc-400 block mb-1">Rasio Gambar</span>
                            <span className="font-semibold">{data.imageRatio || "-"}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Jumlah Variasi Iklan</h4>
                    <p className="text-xs text-zinc-500">Jumlah variasi yang akan diminta di dalam Master Prompt.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, quantity: Math.max(1, data.quantity - 1) })}
                      className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-brand-50 hover:text-brand hover:border-brand transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-2xl font-bold text-brand w-8 text-center">{data.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, quantity: Math.min(5, data.quantity + 1) })}
                      className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-brand-50 hover:text-brand hover:border-brand transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </StepContainer>
          )}

          {/* STEP 12: Results */}
          {step === 12 && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Your Master Prompt</h2>
                  <p className="text-zinc-500">Copy this prompt into ChatGPT, Claude, or Gemini.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-sm font-medium"
                  >
                    {copied ? <><CheckCircle2 size={16} className="text-emerald-600" /> Copied</> : <><Copy size={16} /> Copy Prompt</>}
                  </button>
                  <button
                    onClick={reset}
                    className="bg-brand text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-all text-sm"
                  >
                    Create New
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={copyToClipboard} className="p-2 bg-zinc-100 rounded-md hover:bg-zinc-200">
                      <Copy size={16} />
                   </button>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                  {result}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-zinc-400 text-sm">
          <p>© 2026 AdBrief by Boleh Belajar.</p>
        </div>
      </footer>
    </div>
  );
}
