const axios = require('axios');

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2:3b';
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async callOllama(prompt, maxTokens = 400) {
    const response = await axios.post(`${this.baseURL}/api/generate`, {
      model: this.model,
      prompt,
      stream: false,
      options: { temperature: 0.6, top_p: 0.9, max_tokens: maxTokens }
    });
    return response.data.response.trim();
  }

  parseLines(text, limit = 4) {
    return text
      .split('\n')
      .filter(l => l.trim().length > 0)
      .map(l => l.replace(/^[-•*\d.)]+\s*/, '').trim())
      .filter(l => l.length > 8)
      .slice(0, limit);
  }

  // Simplify report
  async simplifyReport(medicalText) {
    const prompt = `You are a medical expert. Convert this medical report into very simple language for a normal person with no medical knowledge. Use plain English, short sentences, and bullet points where needed.

IMPORTANT: Do NOT mention any personal information such as patient name, age, sex, address, phone number, or any identity details in your response. Focus only on the medical findings and conditions.

Medical Report:
${medicalText}

Simple Explanation:`;
    try {
      return await this.callOllama(prompt, 800);
    } catch (error) {
      throw new Error('Failed to simplify report');
    }
  }

  // Precautions
  async generatePrecautions(medicalText) {
    const prompt = `Based on this medical report, list exactly 3 short precautions the patient should take. Each must be ONE simple sentence. No explanations. No numbering.

IMPORTANT: Do NOT mention any personal information like name, age, sex, or address.

Medical Report:
${medicalText}

3 Precautions:`;
    try {
      const text = await this.callOllama(prompt, 250);
      return this.parseLines(text, 3);
    } catch (error) {
      return ['Follow your doctor\'s advice carefully.'];
    }
  }

  // Short term consequences
  async generateShortTermConsequences(medicalText) {
    const prompt = `Based on this medical report, what are 2-3 short-term effects (within days or weeks) if this condition is ignored? Each must be ONE simple sentence only.

IMPORTANT: Do NOT mention any personal information like name, age, sex, or address.

Medical Report:
${medicalText}

Short-term consequences if ignored:`;
    try {
      const text = await this.callOllama(prompt, 200);
      return this.parseLines(text, 3);
    } catch (error) {
      return ['Condition may worsen without treatment.'];
    }
  }

  // Long term consequences
  async generateLongTermConsequences(medicalText) {
    const prompt = `Based on this medical report, what are 2-3 long-term effects (months or years) if this condition is not treated? Each must be ONE simple sentence only.

IMPORTANT: Do NOT mention any personal information like name, age, sex, or address.

Medical Report:
${medicalText}

Long-term consequences if untreated:`;
    try {
      const text = await this.callOllama(prompt, 200);
      return this.parseLines(text, 3);
    } catch (error) {
      return ['Long-term health complications may develop.'];
    }
  }

  // Diet advice
  async generateDietAdvice(medicalText) {
    const prompt = `Based on this medical report, give 3 simple diet tips for the patient. If diet is not relevant to the condition, just say "No specific diet changes needed." Otherwise give ONE sentence per tip.

IMPORTANT: Do NOT mention any personal information like name, age, sex, or address.

Medical Report:
${medicalText}

Diet advice:`;
    try {
      const text = await this.callOllama(prompt, 200);
      if (text.toLowerCase().includes('no specific')) {
        return ['No specific diet changes needed for this condition.'];
      }
      return this.parseLines(text, 3);
    } catch (error) {
      return ['Maintain a balanced and healthy diet.'];
    }
  }

  // Answer questions
  async answerQuestion(reportText, question) {
    const prompt = `Based on this medical report, answer the question in simple language a normal person can understand.

IMPORTANT: Do NOT mention any personal information like name, age, sex, or address in your answer.

Medical Report:
${reportText}

Question: ${question}

Answer:`;
    try {
      return await this.callOllama(prompt, 300);
    } catch (error) {
      throw new Error('Failed to answer question');
    }
  }
}

module.exports = new OllamaService();
