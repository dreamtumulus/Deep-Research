import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReportData } from '../types';
import { Loader2, AlertCircle, Link as LinkIcon, Download } from 'lucide-react';

interface ReportViewProps {
  data: ReportData;
}

const ReportView: React.FC<ReportViewProps> = ({ data }) => {
  if (data.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium animate-pulse">正在生成深度研究报告...</p>
        <p className="text-sm">根据研究深度，这可能需要几分钟时间。</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-lg font-medium">发生错误</p>
        <p className="text-sm text-center max-w-md">{data.error}</p>
      </div>
    );
  }

  if (!data.markdown) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 opacity-50">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-4xl">📄</span>
        </div>
        <p className="text-lg font-medium">准备开始研究</p>
        <p className="text-sm max-w-xs text-center">配置您的设置，上传文件，然后开始新的深度研究会话。</p>
      </div>
    );
  }

  const handleDownload = () => {
    const blob = new Blob([data.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deep-research-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-800">研究报告 (Research Report)</h2>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors border border-gray-200 px-3 py-1.5 rounded-lg hover:border-primary"
        >
          <Download className="w-4 h-4" />
          导出 Markdown
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="max-w-4xl mx-auto prose prose-blue prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.markdown}
          </ReactMarkdown>
        </div>

        {/* Sources Footer */}
        {data.sources.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              参考网络来源
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary">{source.title}</p>
                    <p className="text-xs text-gray-500 truncate">{source.url}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportView;