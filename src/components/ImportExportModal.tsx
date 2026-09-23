import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  FileCode
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onDataImported
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [fileContent, setFileContent] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'markdown'>('json');
  const [isImporting, setIsImporting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isMd = file.name.endsWith('.md') || file.name.endsWith('.markdown');
    setImportFormat(isMd ? 'markdown' : 'json');

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!fileContent.trim()) return;

    setIsImporting(true);
    setMsg(null);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: importFormat, data: fileContent })
      });

      if (res.ok) {
        const result = await res.json();
        setMsg({ type: 'success', text: `${result.importedCount} éléments importés avec succès !` });
        onDataImported();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.error || 'Échec de l\'importation' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Impossible de se connecter au serveur.' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadExport = () => {
    window.open('/api/export', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Importation & Exportation (Portabilité)</h2>
              <p className="text-xs text-slate-400">
                Sauvegardez vos connaissances ou importez vos notes Notion / Obsidian.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-2 transition-all ${
              activeTab === 'import'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importer Notes (Notion / MD / JSON)</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exporter Base ThoughtFlow (JSON)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {msg && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              msg.type === 'success' 
                ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}

          {activeTab === 'import' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-300 font-medium">Format cible :</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="format"
                    checked={importFormat === 'json'}
                    onChange={() => setImportFormat('json')}
                    className="text-purple-600 focus:ring-purple-500 bg-slate-950"
                  />
                  <span>ThoughtFlow JSON</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="format"
                    checked={importFormat === 'markdown'}
                    onChange={() => setImportFormat('markdown')}
                    className="text-purple-600 focus:ring-purple-500 bg-slate-950"
                  />
                  <span>Notes Markdown (.md)</span>
                </label>
              </div>

              {/* Upload Input */}
              <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 text-center space-y-2 transition-colors">
                <FileCode className="w-8 h-8 mx-auto text-purple-400" />
                <div className="text-xs text-slate-300">
                  <label className="cursor-pointer font-bold text-purple-400 hover:underline">
                    Parcourir un fichier
                    <input type="file" accept=".json,.md,.markdown" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <span> ou coller le contenu ci-dessous</span>
                </div>
              </div>

              <textarea
                rows={5}
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Collez ici du JSON ou du Markdown..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
              />

              <button
                disabled={isImporting || !fileContent.trim()}
                onClick={handleExecuteImport}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Lancer l'Importation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <Download className="w-12 h-12 mx-auto text-purple-400" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Télécharger Votre Archive Globale</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Exporte toutes vos idées, projets, décisions, pivots et relations au format structuré JSON.
                </p>
              </div>

              <button
                onClick={handleDownloadExport}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger thoughtflow-export.json</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
