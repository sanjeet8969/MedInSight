const axios = require('axios');

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2:3b';
  }

  // Check if Ollama is running
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Ollama is not running:', error.message);
      return false;
    }
  }

  // Simplify medical report text
  async simplifyReport(medicalText) {
    const prompt = `You are a medical expert translator. Your task is to convert complex medical reports into simple, easy-to-understand language that a normal person without medical knowledge can comprehend.

Medical Report:
${medicalText}

Instructions:
1. Explain all medical terms in plain English
2. Use simple words (8th-grade reading level)
3. Break down complex information into bullet points
4. Keep the explanation clear and concise
5. Maintain accuracy while simplifying

Simplified Explanation:`;

    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      });

      return response.data.response.trim();
    } catch (error) {
      console.error('❌ Ollama Simplification Error:', error.message);
      throw new Error('Failed to simplify medical report. Please ensure Ollama is running.');
    }
  }

  // Extract key findings from medical text
  async extractKeyFindings(medicalText) {
    const prompt = `Extract the most important medical findings from this report. List only the key findings as bullet points.

Medical Report:
${medicalText}

Key Findings (3-5 bullet points):`;

    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          max_tokens: 300
        }
      });

      const findings = response.data.response
        .trim()
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 5);

      return findings;
    } catch (error) {
      console.error('❌ Ollama Key Findings Error:', error.message);
      return [];
    }
  }

  // Generate health recommendations
  async generateRecommendations(simplifiedText, keyFindings) {
    const prompt = `Based on these medical findings, give exactly 3 short recommendations.
Each recommendation must be ONE simple sentence only. No explanations.

Findings:
${keyFindings.join('\n')}

Recommendations (3 short sentences only):`;

    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.6,
          max_tokens: 400
        }
      });

      let recommendations = response.data.response
        .trim()
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*\d.)]\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 3);

      recommendations.push('⚠️ Consult your doctor before making any medical decisions.');

      return recommendations;
    } catch (error) {
      console.error('❌ Ollama Recommendations Error:', error.message);
      return ['⚠️ Please consult your healthcare provider for personalized recommendations.'];
    }
  }

  // Answer questions about the report
  async answerQuestion(reportText, question) {
    const prompt = `Based on this medical report, answer the following question in simple language.

Medical Report:
${reportText}

Question: ${question}

Answer:`;

    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 300
        }
      });

      return response.data.response.trim();
    } catch (error) {
      console.error('❌ Ollama Q&A Error:', error.message);
      throw new Error('Failed to answer question');
    }
  }
}

module.exports = new OllamaService();
