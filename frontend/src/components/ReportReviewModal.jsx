import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  X, FileText, Calendar, TrendingUp, AlertTriangle, CheckCircle2,
  Edit2, Save, XCircle, User, Pill, Activity, TestTube, Heart,
  AlertCircle, Clock, Zap, ArrowRight
} from 'lucide-react'
import GlowButton from './GlowButton'

const ReportReviewModal = ({ isOpen, onClose, report, onSubmitReview, onSubmitEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Editable analysis fields
  const [editedAnalysis, setEditedAnalysis] = useState({
    symptoms: [],
    diagnoses: [],
    medications: [],
    tests: [],
    vitals: [],
    recommendations: [],
    warnings: []
  })

  useEffect(() => {
    if (report && isOpen) {
      // Initialize editable fields from report
      setEditedAnalysis({
        symptoms: report.ai_analysis?.entities?.symptoms || [],
        diagnoses: report.ai_analysis?.entities?.diagnoses || [],
        medications: report.ai_analysis?.entities?.medications || [],
        tests: report.ai_analysis?.entities?.tests || [],
        vitals: report.ai_analysis?.entities?.vitals || [],
        recommendations: report.ai_analysis?.recommendations || [],
        warnings: report.ai_analysis?.warnings || []
      })
      setReviewNotes('')
      setEditNotes('')
      setIsEditing(false)
    }
  }, [report, isOpen])

  if (!report) return null

  const canEdit = (report.ai_analysis?.confidence_score || 0) < 90
  const confidence = report.ai_analysis?.confidence_score || 0

  const handleAddItem = (category, item) => {
    if (!item.trim()) return
    setEditedAnalysis(prev => ({
      ...prev,
      [category]: [...prev[category], item.trim()]
    }))
  }

  const handleRemoveItem = (category, index) => {
    setEditedAnalysis(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }))
  }

  const handleAddRecommendation = () => {
    const newRec = {
      test: '',
      reason: '',
      contraindications: [],
      confidence: 0,
      urgency: 'medium',
      explanation: ''
    }
    setEditedAnalysis(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, newRec]
    }))
  }

  const handleUpdateRecommendation = (index, field, value) => {
    setEditedAnalysis(prev => ({
      ...prev,
      recommendations: prev.recommendations.map((rec, i) =>
        i === index ? { ...rec, [field]: value } : rec
      )
    }))
  }

  const handleSubmitReview = async () => {
    if (!reviewNotes.trim()) {
      alert('Please enter review notes')
      return
    }

    setSubmitting(true)
    try {
      await onSubmitReview(report.id, reviewNotes)
      onClose()
    } catch (err) {
      console.error('Failed to submit review', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!editNotes.trim()) {
      alert('Please enter editing notes explaining your changes')
      return
    }

    setSubmitting(true)
    try {
      await onSubmitEdit(report.id, editedAnalysis, editNotes)
      onClose()
    } catch (err) {
      console.error('Failed to submit edit', err)
    } finally {
      setSubmitting(false)
    }
  }

  const getConfidenceColor = (score) => {
    if (score < 80) return 'text-red-400'
    if (score < 90) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getUrgencyColor = (urgency) => {
    if (urgency === 'high') return 'text-red-400'
    if (urgency === 'medium') return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-dark/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-medical rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gradient">
                    {isEditing ? 'Edit Report Analysis' : 'Review Report'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Patient ID: {report.patient_id} • {report.pdf_filename}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Report Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass-effect p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Upload Date</span>
                  </div>
                  <div className="font-semibold">
                    {new Date(report.uploaded_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="glass-effect p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">AI Confidence</span>
                  </div>
                  <div className={`font-bold text-xl ${getConfidenceColor(confidence)}`}>
                    {confidence.toFixed(1)}%
                  </div>
                </div>

                <div className="glass-effect p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">Status</span>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      report.status === 'reviewed' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence Alert */}
              {canEdit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect p-4 rounded-xl border-l-4 border-yellow-500"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-400 mb-1">Low Confidence Alert</h3>
                      <p className="text-sm text-gray-300">
                        This report has a confidence score below 90%. You can edit the AI analysis to improve accuracy.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Entities Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  Medical Entities
                </h3>

                {/* Symptoms */}
                <EntitySection
                  title="Symptoms"
                  icon={<AlertCircle className="w-5 h-5" />}
                  items={isEditing ? editedAnalysis.symptoms : (report.ai_analysis?.entities?.symptoms || [])}
                  color="text-red-400"
                  isEditing={isEditing}
                  onAdd={(item) => handleAddItem('symptoms', item)}
                  onRemove={(index) => handleRemoveItem('symptoms', index)}
                />

                {/* Diagnoses */}
                <EntitySection
                  title="Diagnoses"
                  icon={<FileText className="w-5 h-5" />}
                  items={isEditing ? editedAnalysis.diagnoses : (report.ai_analysis?.entities?.diagnoses || [])}
                  color="text-purple-400"
                  isEditing={isEditing}
                  onAdd={(item) => handleAddItem('diagnoses', item)}
                  onRemove={(index) => handleRemoveItem('diagnoses', index)}
                />

                {/* Medications */}
                <EntitySection
                  title="Medications"
                  icon={<Pill className="w-5 h-5" />}
                  items={isEditing ? editedAnalysis.medications : (report.ai_analysis?.entities?.medications || [])}
                  color="text-blue-400"
                  isEditing={isEditing}
                  onAdd={(item) => handleAddItem('medications', item)}
                  onRemove={(index) => handleRemoveItem('medications', index)}
                />

                {/* Tests */}
                <EntitySection
                  title="Tests"
                  icon={<TestTube className="w-5 h-5" />}
                  items={isEditing ? editedAnalysis.tests : (report.ai_analysis?.entities?.tests || [])}
                  color="text-green-400"
                  isEditing={isEditing}
                  onAdd={(item) => handleAddItem('tests', item)}
                  onRemove={(index) => handleRemoveItem('tests', index)}
                />

                {/* Vitals */}
                <EntitySection
                  title="Vitals"
                  icon={<Heart className="w-5 h-5" />}
                  items={isEditing ? editedAnalysis.vitals : (report.ai_analysis?.entities?.vitals || [])}
                  color="text-pink-400"
                  isEditing={isEditing}
                  onAdd={(item) => handleAddItem('vitals', item)}
                  onRemove={(index) => handleRemoveItem('vitals', index)}
                />
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Recommendations
                  </h3>
                  {isEditing && (
                    <button
                      onClick={handleAddRecommendation}
                      className="px-3 py-1 glass-effect rounded-lg text-sm hover:bg-white/10 transition"
                    >
                      + Add Recommendation
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {(isEditing ? editedAnalysis.recommendations : (report.ai_analysis?.recommendations || [])).map((rec, index) => (
                    <RecommendationCard
                      key={index}
                      recommendation={rec}
                      index={index}
                      isEditing={isEditing}
                      onUpdate={(field, value) => handleUpdateRecommendation(index, field, value)}
                      onRemove={() => handleRemoveItem('recommendations', index)}
                    />
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {((isEditing ? editedAnalysis.warnings : (report.ai_analysis?.warnings || [])).length > 0) && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Warnings
                  </h3>
                  <EntitySection
                    items={isEditing ? editedAnalysis.warnings : (report.ai_analysis?.warnings || [])}
                    color="text-yellow-400"
                    isEditing={isEditing}
                    onAdd={(item) => handleAddItem('warnings', item)}
                    onRemove={(index) => handleRemoveItem('warnings', index)}
                  />
                </div>
              )}

              {/* Review/Edit Notes */}
              {!isEditing ? (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">Review Notes</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter your review notes here..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 resize-none focus:outline-none focus:border-accent transition"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">Edit Notes (Required)</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Explain the changes you made to the AI analysis..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 resize-none focus:outline-none focus:border-accent transition"
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-white/10 p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {canEdit && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 glass-effect rounded-xl hover:bg-white/10 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Analysis
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 glass-effect rounded-xl hover:bg-white/10 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 glass-effect rounded-xl hover:bg-white/10 transition"
                  disabled={submitting}
                >
                  Close
                </button>
                {!isEditing ? (
                  <GlowButton
                    onClick={handleSubmitReview}
                    disabled={submitting || !reviewNotes.trim() || report.status !== 'pending'}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </GlowButton>
                ) : (
                  <GlowButton
                    onClick={handleSubmitEdit}
                    disabled={submitting || !editNotes.trim()}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </GlowButton>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Entity Section Component
const EntitySection = ({ title, icon, items, color, isEditing, onAdd, onRemove }) => {
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem)
      setNewItem('')
    }
  }

  if (!items || items.length === 0) {
    return isEditing ? (
      <div className="glass-effect p-4 rounded-xl">
        {title && (
          <div className="flex items-center gap-2 mb-3">
            {icon}
            <h4 className={`font-semibold ${color}`}>{title}</h4>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Add ${title?.toLowerCase() || 'item'}...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition"
          >
            Add
          </button>
        </div>
      </div>
    ) : null
  }

  return (
    <div className="glass-effect p-4 rounded-xl">
      {title && (
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h4 className={`font-semibold ${color}`}>{title}</h4>
        </div>
      )}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <span className="text-sm">{item}</span>
            {isEditing && (
              <button
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-300 transition"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {isEditing && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={`Add ${title?.toLowerCase() || 'item'}...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition text-sm"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Recommendation Card Component
const RecommendationCard = ({ recommendation, index, isEditing, onUpdate, onRemove }) => {
  const getUrgencyColor = (urgency) => {
    if (urgency === 'high') return 'text-red-400'
    if (urgency === 'medium') return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="glass-effect p-4 rounded-xl border-l-4 border-accent">
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <input
              type="text"
              value={recommendation.test}
              onChange={(e) => onUpdate('test', e.target.value)}
              placeholder="Test/Procedure name"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent transition"
            />
            <button
              onClick={onRemove}
              className="text-red-400 hover:text-red-300 transition p-2"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <textarea
            value={recommendation.reason}
            onChange={(e) => onUpdate('reason', e.target.value)}
            placeholder="Reason for recommendation"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent transition"
            rows="2"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Urgency</label>
              <select
                value={recommendation.urgency}
                onChange={(e) => onUpdate('urgency', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Confidence (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={recommendation.confidence}
                onChange={(e) => onUpdate('confidence', parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <textarea
            value={recommendation.explanation || ''}
            onChange={(e) => onUpdate('explanation', e.target.value)}
            placeholder="Detailed explanation (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent transition"
            rows="2"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-accent">{recommendation.test}</h4>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-semibold ${getUrgencyColor(recommendation.urgency)}`}>
                {recommendation.urgency?.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">
                {recommendation.confidence?.toFixed(0)}% confident
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300">{recommendation.reason}</p>
          {recommendation.explanation && (
            <p className="text-xs text-gray-400 mt-2">{recommendation.explanation}</p>
          )}
          {recommendation.contraindications && recommendation.contraindications.length > 0 && (
            <div className="mt-2 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-400">
                <strong>Contraindications:</strong> {recommendation.contraindications.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReportReviewModal
