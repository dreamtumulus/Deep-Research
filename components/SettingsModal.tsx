import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Key, Cpu, Zap, Globe, Brain } from 'lucide-react';
import { ResearchConfig, ModelType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ResearchConfig;
  onSave: (config: ResearchConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<ResearchConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <SettingsIcon className="w-5 h-5 text-primary" />
            系统设置
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* API Key Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Gemini API Key
            </label>
            <input
              type="password"
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              placeholder="默认使用系统预设Key，或输入自定义Key"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm"
            />
            <p className="text-xs text-gray-500">
              Key 仅存储在本地浏览器中。如果您留空，将尝试使用系统默认配置的 Key。
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              模型选择 (Model)
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setLocalConfig({ ...localConfig, model: ModelType.FLASH })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  localConfig.model === ModelType.FLASH
                    ? 'border-primary bg-blue-50 text-primary'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className="font-medium text-sm flex items-center justify-between">
                  Gemini 2.5 Flash
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs opacity-75 mt-1">速度快，延迟低。适合一般性研究。</div>
              </button>

              <button
                onClick={() => setLocalConfig({ ...localConfig, model: ModelType.PRO })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  localConfig.model === ModelType.PRO
                    ? 'border-primary bg-blue-50 text-primary'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className="font-medium text-sm flex items-center justify-between">
                  Gemini 3.0 Pro Preview
                  <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">推荐</span>
                </div>
                <div className="text-xs opacity-75 mt-1">推理能力最强，适合复杂的深度研究。</div>
              </button>
            </div>
          </div>
          
           {/* Thinking Budget Config */}
           <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> 思考预算 (Thinking Budget)
                </label>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {localConfig.thinkingBudget} tokens
                </span>
             </div>
             <input 
                type="range" 
                min="0" 
                max="16000" 
                step="1024"
                value={localConfig.thinkingBudget}
                onChange={(e) => setLocalConfig({...localConfig, thinkingBudget: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
             />
             <p className="text-xs text-gray-500">
               分配模型在回答前用于“思考”的 token 预算。数值越高，复杂任务的推理效果越好。设为 0 以禁用。
             </p>
           </div>

        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;