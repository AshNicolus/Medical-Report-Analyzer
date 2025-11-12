import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, FileText, AlertTriangle, 
  Activity, Pill, TestTube, ThermometerSun, TrendingUp,
  CheckCircle, XCircle, X, Info
} from 'lucide-react'

const ReportSummary = ({ isOpen, onClose, analysisData, reportName }) => {
  const [expandedSections, setExpandedSections] = useState({
    entities: true,
    recommendations: true,
    warnings: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (!isOpen) return null

  const { entities = {}, recommendations = [], warnings = [], confidence_score = 0 } = analysisData || {}

  // Helper to get color based on urgency
  const getUrgencyColor = (urgency) => {
    const colors = {
      high: 'text-red-400 bg-red-500/10 border-red-500/20',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      low: 'text-green-400 bg-green-500/10 border-green-500/20',
      routine: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
    return colors[urgency?.toLowerCase()] || colors.routine
  }

  // Helper to get confidence color
  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl max-h-[90vh] glass-effect rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-medical p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Analysis Summary</h2>
                <p className="text-sm text-white/70">{reportName || 'Medical Report'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-white/70">Confidence Score</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(confidence_score)}`}>
                  {confidence_score/100?.toFixed(1) || 0}%
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* Section 1: Extracted Entities */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glow-card"
            >
              <button
                onClick={() => toggleSection('entities')}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-accent" />
                  <h3 className="text-xl font-bold">Extracted Medical Entities</h3>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                    {Object.keys(entities).filter(key => entities[key]?.length > 0).length} categories
                  </span>
                </div>
                {expandedSections.entities ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.entities && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Category</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Items Found</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Symptoms */}
                          {entities.symptoms?.length > 0 && (
                            <tr className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <ThermometerSun className="w-4 h-4 text-orange-400" />
                                  <span className="font-medium">Symptoms</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {entities.symptoms.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-sm text-gray-400">
                                {entities.symptoms.length}
                              </td>
                            </tr>
                          )}

                          {/* Diagnoses */}
                          {entities.diagnoses?.length > 0 && (
                            <tr className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-red-400" />
                                  <span className="font-medium">Diagnoses</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {entities.diagnoses.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-sm text-gray-400">
                                {entities.diagnoses.length}
                              </td>
                            </tr>
                          )}

                          {/* Medications */}
                          {entities.medications?.length > 0 && (
                            <tr className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Pill className="w-4 h-4 text-blue-400" />
                                  <span className="font-medium">Medications</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {entities.medications.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-sm text-gray-400">
                                {entities.medications.length}
                              </td>
                            </tr>
                          )}

                          {/* Tests */}
                          {entities.tests?.length > 0 && (
                            <tr className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <TestTube className="w-4 h-4 text-purple-400" />
                                  <span className="font-medium">Tests Performed</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {entities.tests.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-sm text-gray-400">
                                {entities.tests.length}
                              </td>
                            </tr>
                          )}

                          {/* Vitals */}
                          {entities.vitals?.length > 0 && (
                            <tr className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                  <span className="font-medium">Vital Signs</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {entities.vitals.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-sm text-gray-400">
                                {entities.vitals.length}
                              </td>
                            </tr>
                          )}

                          {/* Severity */}
                          {entities.severity?.length > 0 && (
                            <tr className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                  <span className="font-medium">Severity Indicators</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {entities.severity.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-sm text-gray-400">
                                {entities.severity.length}
                              </td>
                            </tr>
                          )}

                          {/* Urgency */}
                          {entities.urgency?.length > 0 && (
                            <tr className="hover:bg-white/5">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Info className="w-4 h-4 text-cyan-400" />
                                  <span className="font-medium">Urgency Level</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {entities.urgency.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-sm text-gray-400">
                                {entities.urgency.length}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {Object.keys(entities).filter(key => entities[key]?.length > 0).length === 0 && (
                        <p className="text-center text-gray-400 py-4">No entities extracted from this report.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Section 2: AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glow-card"
            >
              <button
                onClick={() => toggleSection('recommendations')}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <h3 className="text-xl font-bold">AI Recommendations</h3>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                    {recommendations.length} items
                  </span>
                </div>
                {expandedSections.recommendations ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.recommendations && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {recommendations.length > 0 ? (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Test/Action</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Reason</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Urgency</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recommendations.map((rec, idx) => (
                              <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 px-4">
                                  <div className="font-medium text-white">{rec.test}</div>
                                  {rec.explanation && (
                                    <div className="text-xs text-gray-400 mt-1">{rec.explanation}</div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-300">
                                  {rec.reason}
                                  {rec.contraindications?.length > 0 && (
                                    <div className="mt-1 text-xs text-red-400">
                                      ⚠️ Contraindications: {rec.contraindications.join(', ')}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(rec.urgency)}`}>
                                    {rec.urgency || 'Routine'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`font-bold ${getConfidenceColor(rec.confidence)}`}>
                                    {rec.confidence?.toFixed(0) || 0}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-center text-gray-400 py-4">No recommendations available.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Section 3: Warnings & Alerts */}
            {warnings?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glow-card border-l-4 border-red-500"
              >
                <button
                  onClick={() => toggleSection('warnings')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="text-xl font-bold text-red-400">Warnings & Alerts</h3>
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                      {warnings.length} alerts
                    </span>
                  </div>
                  {expandedSections.warnings ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.warnings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {warnings.map((warning, idx) => (
                          <div key={idx} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">{warning}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 bg-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              💡 This analysis is AI-generated. Please consult with a healthcare professional for medical advice.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-medical rounded-lg font-semibold hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ReportSummary
