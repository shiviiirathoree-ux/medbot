import { useState, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertTriangle, CheckCircle2, Loader2, Scan, X, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ReportScanner() {
  const { t } = useLanguage()
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showOcr, setShowOcr] = useState(false)

  const handleFile = (f) => {
    if (!f) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(f.type)) { toast.error('Only images (JPG, PNG, WebP) and PDFs are allowed'); return }
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB'); return }
    setFile(f)
    setResult(null)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const analyze = async () => {
    if (!file) { toast.error('Please upload a file first'); return }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('report', file)
      const res = await api.post('/upload/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      setResult(res.data.data)
      toast.success('Report analyzed successfully!')
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.')
    } finally { setLoading(false) }
  }

  const reset = () => { setFile(null); setPreview(null); setResult(null) }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">{t('reports.title')}</h1>
        <p className="text-slate-400 text-sm mt-1">Upload your medical reports for AI-powered analysis and simplified summaries</p>
      </div>

      {/* Upload Zone */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`card border-2 border-dashed transition-all duration-200 cursor-pointer ${dragOver ? 'border-primary-500 bg-primary-900/10' : 'border-white/10 hover:border-white/20'}`}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div className="text-center py-12">
            <motion.div animate={{ y: dragOver ? -8 : 0 }} className="w-20 h-20 rounded-2xl bg-primary-900/30 border border-primary-700/30 flex items-center justify-center mx-auto mb-4">
              {file ? <FileText className="w-10 h-10 text-primary-400" /> : <Upload className="w-10 h-10 text-primary-400" />}
            </motion.div>
            {file ? (
              <div>
                <p className="font-semibold text-white text-lg">{file.name}</p>
                <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB · Ready to analyze</p>
                <button onClick={e => { e.stopPropagation(); reset() }} className="mt-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto">
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-white text-lg">{t('reports.drag')}</p>
                <p className="text-slate-400 text-sm mt-2">or click to browse · JPG, PNG, PDF up to 10MB</p>
                <div className="mt-4 flex justify-center gap-3">
                  {['Blood Test', 'X-Ray', 'MRI Scan', 'ECG', 'Urine Test'].map(l => (
                    <span key={l} className="badge-primary text-xs">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input id="file-input" type="file" className="hidden" accept="image/*,.pdf" onChange={e => handleFile(e.target.files[0])} />
        </motion.div>
      )}

      {/* Preview + Analyze */}
      <AnimatePresence>
        {file && !result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-4 items-start">
            {preview && (
              <div className="w-full sm:w-64 flex-shrink-0">
                <img src={preview} alt="Report preview" className="w-full rounded-xl border border-white/10 max-h-64 object-contain bg-black/20" />
              </div>
            )}
            <div className="flex-1">
              <div className="card bg-primary-900/20 border border-primary-700/20">
                <div className="flex items-center gap-3 mb-3">
                  <Scan className="w-5 h-5 text-primary-400" />
                  <h3 className="font-semibold text-white">AI Analysis</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">Our AI will extract text using OCR and generate a patient-friendly summary with highlighted abnormal values.</p>
                <motion.button
                  id="analyze-report" onClick={analyze} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {t('reports.analyzing')}</>
                  ) : (
                    <><Scan className="w-4 h-4" /> Analyze Report</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Success banner */}
            <div className="card border border-emerald-700/30 bg-emerald-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Analysis Complete</p>
                    <p className="text-xs text-slate-400">Saved to your health records</p>
                  </div>
                </div>
                <button onClick={reset} className="btn-secondary text-xs px-3 py-2">Analyze Another</button>
              </div>
            </div>

            {/* AI Summary */}
            <div className="card">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-lg">🤖</span> {t('reports.summary')}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{result.summary || 'Analysis complete.'}</p>
            </div>

            {/* Abnormal Values */}
            {result.abnormalValues?.length > 0 && (
              <div className="card border border-red-700/20">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" /> {t('reports.abnormal')}
                </h3>
                <div className="space-y-2">
                  {result.abnormalValues.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-900/20 border border-amber-700/20">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-200">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OCR Text (collapsible) */}
            {result.ocrText && result.ocrText.length > 50 && (
              <div className="card">
                <button onClick={() => setShowOcr(p => !p)} className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium text-slate-300">Extracted Text (OCR)</span>
                  {showOcr ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                <AnimatePresence>
                  {showOcr && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <pre className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{result.ocrText}</pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-slate-500 text-center italic px-4">
              ⚠️ AI analysis is for informational purposes only. Always consult your doctor for medical advice.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {!file && !result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: '🔍', title: 'OCR Extraction', desc: 'We extract text from your report using advanced OCR technology' },
            { emoji: '🤖', title: 'AI Analysis',    desc: 'Gemini AI generates a simplified summary you can easily understand' },
            { emoji: '⚠️',  title: 'Flag Abnormal',  desc: 'Abnormal values are highlighted with easy-to-understand explanations' },
          ].map(tip => (
            <div key={tip.title} className="card text-center">
              <span className="text-3xl">{tip.emoji}</span>
              <h4 className="font-semibold text-white mt-3 text-sm">{tip.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
