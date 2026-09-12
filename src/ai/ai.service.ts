import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';

type Evaluation = {
  date: string;
  score: number;
  message: string;
};

@Injectable()
export class AiService {
  private readonly AI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);
  constructor() {
    this.AI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async analyzeResponse(responseMessage: string): Promise<number> {
    try {
      const model = this.AI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const prompt = `
        Sen bir İnsan Kaynakları (İK) uzmanısın. 
        Aşağıda bir şirketin iş başvurusunda bulunan bir adaya gönderdiği e-posta/mesaj yer alıyor.
        Bu mesajı nezaket, açıklık, profesyonellik ve adaya verilen değer açısından analiz et.
        Bana SADECE 1 ile 100 arasında bir sayı dön. Başka hiçbir kelime, noktalama işareti veya açıklama yazma.
        
        Şirketin Mesajı: "${responseMessage}"
      `;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const textResult = response.text().trim();
      const score = parseInt(textResult, 10);
      if (isNaN(score)) {
        return 0;
      }
      return score;
    } catch (error) {
      this.logger.error('Yapay Zeka analizi sırasında hata oluştu:', error);
      return 0;
    }
  }

  async generateCompanyOpinion(evaluations: Evaluation[]): Promise<string> {
    try {
      const model = this.AI.getGenerativeModel({ model: 'gemini-3.6-flash' });

      // Değerlendirmeleri okunabilir formata dönüştür
      const evaluationText = evaluations
        .map(
          (e, i) =>
            `[Değerlendirme ${i + 1}] Tarih: ${e.date} | Puan: ${e.score}/100\nMesaj: "${e.message}"`,
        )
        .join('\n\n');

      const prompt = `
        Sen deneyimli bir İnsan Kaynakları (İK) analistisin.
        Aşağıda bir şirketin iş başvurularına verdiği yanıtlar kronolojik sırayla (eskiden yeniye) listelenmiştir.
        Her yanıtın tarihi ve 100 üzerinden kalite puanı verilmiştir.

        ${evaluationText}

        Bu verilere dayanarak aşağıdaki başlıkları kapsayan kapsamlı bir şirket görüşü yaz:
        1. Genel iletişim kalitesi değerlendirmesi
        2. Güçlü yanlar
        3. Zayıf yanlar veya geliştirilmesi gereken alanlar
        4. Zamansal trend analizi: Şirket zaman içinde kendini geliştirdi mi, yoksa iletişim kalitesi düştü mü? Bunu somut verilerle destekle.
        5. Son dönem değerlendirmesi ve öneri

        KURALLAR:
        - Türkçe yaz
        - 150 ile 300 kelime arasında tut
        - Analitik ve profesyonel bir dil kullan
        - Somut tarihler ve puanlara atıfta bulun
        - Başlık veya madde işareti kullanma, akıcı paragraf olarak yaz
      `;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      this.logger.error('Şirket görüşü üretilirken hata oluştu:', error);
      return '';
    }
  }
}

