import React, { useState, useEffect } from 'react';
import { Settings, FileText, Upload, Search, Trash2, Plus, Sparkles, Database, FileType, Globe } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import ReportView from './components/ReportView';
import { parseFile } from './utils/fileParser';
import { generateResearchReport } from './services/geminiService';
import { ResearchConfig, UploadedFile, ReportData, ModelType } from './types';

const App: React.FC = () => {
  // Config State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<ResearchConfig>({
    apiKey: localStorage.getItem('gemini_api_key') || '',
    model: ModelType.FLASH, 
    useGoogleSearch: true,
    useLocalContext: true,
    thinkingBudget: 0,
    language: 'Chinese',
  });

  // App State
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<ReportData>({
    markdown: '',
    sources: [],
    loading: false,
    status: 'idle'
  });

  // Persist API Key
  useEffect(() => {
    if (config.apiKey) {
      localStorage.setItem('gemini_api_key', config.apiKey);
    } else {
       // If empty, remove from local storage (will fallback to process.env in service)
       localStorage.removeItem('gemini_api_key');
    }
  }, [config.apiKey]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        const parsed = await parseFile(file);
        newFiles.push(parsed);
      }
      setFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset input
    event.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleStartResearch = async () => {
    if (!query.trim()) return;
    
    // Check if we have an API key (either custom or env)
    const hasKey = config.apiKey || process.env.API_KEY;

    if (!hasKey) {
      setIsSettingsOpen(true);
      return;
    }

    setReport({ markdown: '', sources: [], loading: true, status: 'starting' });

    try {
      const result = await generateResearchReport(
        query,
        files,
        config,
        (status) => setReport(prev => ({ ...prev, status }))
      );
      setReport({
        markdown: result.text,
        sources: result.sources,
        loading: false,
        status: 'done'
      });
    } catch (error: any) {
      setReport({
        markdown: '',
        sources: [],
        loading: false,
        error: error.message || "报告生成失败",
        status: 'error'
      });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-background overflow-hidden font-sans text-gray-900">
      
      {/* Left Sidebar (Controls) */}
      <aside className="w-full md:w-[400px] flex flex-col border-r border-gray-200 bg-white h-full z-20 shadow-xl md:shadow-none">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
             <div className="bg-primary/10 p-2 rounded-lg">
                <Database className="w-6 h-6" />
             </div>
             <h1 className="text-xl font-bold tracking-tight text-gray-900">DeepResearch Pro</h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
            title="设置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section: Research Query */}
          <div className="space-y-3">
             <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                研究课题 (Topic)
             </label>
             <textarea
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="例如：分析量子计算对2030年密码学的影响..."
               className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-sm leading-relaxed transition-all shadow-sm"
             />
          </div>

          {/* Section: Search Mode Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              搜索模式 (Search Mode)
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setConfig(prev => ({ ...prev, useGoogleSearch: !prev.useGoogleSearch }))}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  config.useGoogleSearch
                    ? 'bg-blue-50 border-primary text-primary'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Globe className="w-4 h-4" />
                互联网搜索
              </button>
              <button
                onClick={() => setConfig(prev => ({ ...prev, useLocalContext: !prev.useLocalContext }))}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  config.useLocalContext
                    ? 'bg-blue-50 border-primary text-primary'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                知识库
              </button>
            </div>
            {!config.useGoogleSearch && !config.useLocalContext && (
                <p className="text-xs text-red-500">请至少选择一种搜索来源。</p>
            )}
          </div>

          {/* Section: Context Data (RAG) */}
          <div className={`space-y-3 transition-opacity duration-200 ${config.useLocalContext ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
             <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  知识库文件 (Knowledge Base)
                </label>
                <span className="text-xs text-gray-400">{files.length} 个文件</span>
             </div>
             
             <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept=".txt,.md,.csv,.json,.docx,.pdf,.jpg,.png,.jpeg"
                />
                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-700">点击或拖拽上传</p>
                <p className="text-xs text-gray-400 mt-1">支持 Doc, 表格, PDF, 图片等</p>
             </div>

             {files.length > 0 && (
               <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-1">
                 {files.map(file => (
                   <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-white flex items-center justify-center border border-gray-100 shrink-0">
                           <FileType className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                           <p className="text-[10px] text-gray-400 uppercase">{file.type} • {file.tokenCount} tokens</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
           <button
             onClick={handleStartResearch}
             disabled={report.loading || !query.trim() || (!config.useGoogleSearch && !config.useLocalContext)}
             className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${
               report.loading || !query.trim() || (!config.useGoogleSearch && !config.useLocalContext)
                 ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                 : 'bg-primary hover:bg-blue-700 shadow-blue-500/30'
             }`}
           >
             {report.loading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  研究中...
                </>
             ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  开始深度研究
                </>
             )}
           </button>
           <p className="text-center text-xs text-gray-400 mt-3">
             Powered by Google Gemini Models
           </p>
        </div>
      </aside>

      {/* Right Content (Report) */}
      <main className="flex-1 bg-gray-50/50 p-4 md:p-6 overflow-hidden h-full">
         <ReportView data={report} />
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={setConfig}
      />
    </div>
  );
};

export default App;