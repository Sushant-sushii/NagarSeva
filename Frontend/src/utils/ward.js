import { GoogleGenAI } from '@google/genai';

// Initialize the official SDK client
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

/**
 * Classifies and extracts the exact numeric municipal ward identifier using the Gemini API.
 * 
 * @param {number} latitude - User's current latitude
 * @param {number} longitude - User's current longitude
 * @param {object} rawLocationData - Full address payload returned from the location lookup service
 * @returns {Promise<string>} Clean numerical ward string
 */
export const classifyWardWithGemini = async (latitude, longitude, rawLocationData) => {
  try {
    const prompt = `
      You are provided with a specific geographic location footprint:
      - Coordinates: Latitude: ${latitude}, Longitude: ${longitude}
      - Location Info: ${JSON.stringify(rawLocationData)}

      Task: 
      Determine the official, specific municipal or administrative WARD NUMBER digits for this area. 
      For example, if the location matches a neighborhood like "Husainabad" in Lucknow, cross-reference your knowledge of that city's municipal corporation boundaries to find its assigned numeric ward code (e.g., "59"). 

      CRITICAL RULE: 
      Do NOT return the text name of the neighborhood or area. You MUST return ONLY the numeric digits or official alphanumeric code representing the ward number.
    `;

    // Execute structured request using the recommended flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a strict geospatial database parsing agent. Your sole purpose is to map location descriptors to their corresponding official municipal ward numbers. Never output names, words, or sentences—only the clean ward number identifier.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            wardNumber: {
              type: 'STRING',
              description: 'The strict numerical digits or official alphanumeric code representing the municipal ward index.'
            }
          },
          required: ['wardNumber']
        }
      }
    });

    const data = JSON.parse(response.text);
    
    if (data && data.wardNumber) {
      return data.wardNumber.trim();
    }
    
    throw new Error('Ward key not found in structural response context.');
  } catch (error) {
    console.error('Gemini Classification Error:', error);
    throw new Error('AI engine failed to cleanly extract a numerical ward value from this footprint.');
  }
};