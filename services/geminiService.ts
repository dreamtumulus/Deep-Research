import { GoogleGenAI, Tool } from "@google/genai";
import { ResearchConfig, UploadedFile } from "../types";

export const generateResearchReport = async (
  query: string,
  files: UploadedFile[],
  config: ResearchConfig,
  onStatusUpdate: (status: string) => void
): Promise<{ text: string; sources: any[] }> => {
  
  const apiKey = config.apiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // Prepare tools
  const tools: Tool[] = [];
  if (config.useGoogleSearch) {
    tools.push({ googleSearch: {} });
  }

  // Prepare system instruction in Chinese
  const systemInstruction = `
    你是一名专家级的深度研究助手 (Deep Research Assistant)。你的目标是根据用户的查询和提供的上下文（如果有），生成一份全面、专业且结构合理的中文研究报告。
    
    请严格遵循以下步骤：
    1. **分析**：分析用户的请求以及任何附加的文档内容。
    2. **规划**：规划研究结构。
    3. **搜索/检索**：
       - 如果启用了 Google 搜索，利用它收集最新信息、统计数据和可验证的事实。
       - 如果提供了本地文件（知识库），请深度分析这些文件中的信息。
    4. **综合**：整合来自互联网（如果使用）和用户上传文件（如果使用）的信息。
    5. **撰写**：使用 Markdown 格式撰写详细的报告。
    
    报告结构应包括：
    - **标题**：清晰且吸引人。
    - **执行摘要 (Executive Summary)**：高层次的概述。
    - **关键发现 (Key Findings)**：详细分析，使用要点列出，进行数据综合。
    - **深度剖析 (Deep Dive)**：针对请求的具体方面进行深入探讨。
    - **结论与建议 (Conclusion)**：最终想法和行动建议。
    - **参考文献**：(如果使用了搜索工具，系统会自动处理引用，但你应该在文本中明确提及来源名称)。

    格式要求：
    - 使用 H1, H2, H3 作为标题。
    - 适当时使用表格对比数据。
    - 使用粗体强调重点。
    - 保持语气专业、客观、学术。
    - **必须使用简体中文输出**。
  `;

  // Prepare contents
  const parts: any[] = [];

  // Add file context ONLY if useLocalContext is true
  if (config.useLocalContext && files.length > 0) {
    onStatusUpdate('reading_files');
    for (const file of files) {
      if (file.mimeType.startsWith('text/') || file.type === 'csv' || file.type === 'json') {
        parts.push({
          text: `[本地文件: ${file.name}]\n${file.content}\n---`
        });
      } else if (file.mimeType === 'application/pdf' || file.mimeType.startsWith('image/')) {
          // PDF or Image
          parts.push({
              inlineData: {
                  mimeType: file.mimeType,
                  data: file.content as string // Base64 string without prefix
              }
          });
          parts.push({ text: `[附带文件: ${file.name}]` });
      }
    }
  }

  // Add User Query
  parts.push({ text: `用户研究课题: ${query}` });

  // Config options
  const generationConfig: any = {
    systemInstruction,
    tools: tools.length > 0 ? tools : undefined,
    thinkingConfig: config.thinkingBudget > 0 ? { thinkingBudget: config.thinkingBudget } : undefined,
  };

  onStatusUpdate('analyzing');

  try {
    const response = await ai.models.generateContent({
      model: config.model,
      contents: { parts },
      config: generationConfig,
    });

    const text = response.text || "未能生成报告，请重试。";
    
    // Extract sources if available
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, url: chunk.web.uri } : null)
      .filter((s: any) => s !== null) || [];

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};