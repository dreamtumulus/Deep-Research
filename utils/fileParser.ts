import { UploadedFile } from '../types';
import * as XLSX from 'xlsx'; // Assuming xlsx is available in the environment
import mammoth from 'mammoth'; // Assuming mammoth is available
import Papa from 'papaparse'; // Assuming papaparse is available

// Helper to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Helper to read file as ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Helper to read file as Data URL (Base64)
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parseFile = async (file: File): Promise<UploadedFile> => {
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  let content: string | ArrayBuffer | null = null;
  let mimeType = file.type;

  try {
    if (fileExt === 'txt' || fileExt === 'md' || fileExt === 'json' || fileExt === 'csv') {
      content = await readFileAsText(file);
    } else if (fileExt === 'pdf') {
       // PDF parsing in browser is heavy. For this demo, we treat it as a binary blob for Gemini to handle if supported, 
       // or we would need pdf.js. 
       // Gemini 1.5/2.5 accepts PDF mime type directly in 'inlineData'.
       const base64Url = await readFileAsDataURL(file);
       // Strip the data:application/pdf;base64, part
       content = base64Url.split(',')[1];
       mimeType = 'application/pdf';
    } else if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fileExt || '')) {
      const base64Url = await readFileAsDataURL(file);
      content = base64Url.split(',')[1]; // Keep only base64 data
    } else if (fileExt === 'docx') {
       // Try to parse text using mammoth
       try {
         const arrayBuffer = await readFileAsArrayBuffer(file);
         const result = await mammoth.extractRawText({ arrayBuffer });
         content = result.value;
         mimeType = 'text/plain'; // Treated as text after parsing
       } catch (e) {
         console.warn("Mammoth failed, falling back to treating as binary docx if supported", e);
         content = "解析 DOCX 失败。建议转换为 PDF 或文本。";
         mimeType = 'text/error';
       }
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
       try {
         const arrayBuffer = await readFileAsArrayBuffer(file);
         const workbook = XLSX.read(arrayBuffer, { type: 'array' });
         const sheetName = workbook.SheetNames[0];
         const worksheet = workbook.Sheets[sheetName];
         content = XLSX.utils.sheet_to_csv(worksheet);
         mimeType = 'text/csv';
       } catch (e) {
         console.warn("XLSX parse failed", e);
         content = "解析表格失败。";
         mimeType = 'text/error';
       }
    } else {
      content = "不支持的文件类型。";
      mimeType = 'application/octet-stream';
    }
  } catch (error) {
    console.error("Error parsing file", error);
    content = "读取文件时发生错误。";
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    type: fileExt || 'unknown',
    content,
    mimeType,
    tokenCount: typeof content === 'string' ? Math.ceil(content.length / 4) : 0, // Rough estimate
  };
};