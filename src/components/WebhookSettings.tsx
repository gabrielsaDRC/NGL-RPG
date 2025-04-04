import React, { useState } from 'react';
import { Settings, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { WebhookSettings } from '../types/webhook';

interface WebhookSettingsProps {
  settings: WebhookSettings;
  onSettingsChange: (settings: WebhookSettings) => void;
}

export const WebhookSettingsPanel: React.FC<WebhookSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateWebhookUrl = (url: string) => {
    const webhookPattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/;
    return webhookPattern.test(url);
  };

  const testWebhook = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: "🎲 Teste de conexão do Sistema de RPG",
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem de teste: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      return false;
    }
  };

  const handleAddUrl = async () => {
    setError(null);
    const trimmedUrl = newUrl.trim();

    if (!trimmedUrl) {
      setError('Por favor, insira uma URL');
      return;
    }

    if (!validateWebhookUrl(trimmedUrl)) {
      setError('URL do webhook inválida');
      return;
    }

    if (settings.urls.includes(trimmedUrl)) {
      setError('Esta URL já foi adicionada');
      return;
    }

    const isValid = await testWebhook(trimmedUrl);
    if (!isValid) {
      setError('Não foi possível conectar ao webhook. Verifique a URL e tente novamente.');
      return;
    }

    const updatedUrls = [...settings.urls, trimmedUrl];
    onSettingsChange({
      ...settings,
      urls: updatedUrls,
      selectedUrl: settings.selectedUrl || trimmedUrl,
    });
    setNewUrl('');
  };

  const handleRemoveUrl = (url: string) => {
    const updatedUrls = settings.urls.filter(u => u !== url);
    onSettingsChange({
      ...settings,
      urls: updatedUrls,
      selectedUrl: settings.selectedUrl === url ? (updatedUrls[0] || null) : settings.selectedUrl,
    });
  };

  const handleSelectUrl = async (url: string) => {
    setError(null);
    const isValid = await testWebhook(url);
    
    if (!isValid) {
      setError('Não foi possível conectar ao webhook selecionado.');
      handleRemoveUrl(url);
      return;
    }

    onSettingsChange({
      ...settings,
      selectedUrl: url,
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
      >
        <Settings size={20} />
        <span>Webhook</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-[#1a1a1a] border border-[#00ffe1] rounded-lg p-4 shadow-lg">
          <h3 className="text-[#00ffe1] font-semibold mb-4">Configurar Webhook do Discord</h3>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="URL do Webhook"
                className="flex-1 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-2"
              />
              <button
                onClick={handleAddUrl}
                disabled={!newUrl.trim()}
                className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-2 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              {settings.urls.map((url) => (
                <div
                  key={url}
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg border ${
                    url === settings.selectedUrl
                      ? 'border-[#00ff88] bg-[#2a2a2a]'
                      : 'border-[#00ffe1]'
                  }`}
                >
                  <button
                    onClick={() => handleSelectUrl(url)}
                    className="flex-1 text-left text-[#00ffe1] text-sm truncate hover:text-[#00ff88]"
                  >
                    {url}
                  </button>
                  <button
                    onClick={() => handleRemoveUrl(url)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {settings.urls.length === 0 && (
                <div className="text-[#00ffe1]/50 text-sm text-center py-2">
                  Nenhum webhook configurado
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};