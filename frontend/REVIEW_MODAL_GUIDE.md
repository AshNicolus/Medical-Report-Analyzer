# Report Review Modal Component Guide

## Overview
The `ReportReviewModal` component provides a comprehensive interface for doctors to review and edit AI-analyzed medical reports. It features conditional editing based on AI confidence scores and structured data management.

## Features

### 🔍 **View Mode**
- Display full report analysis
- View all medical entities (symptoms, diagnoses, medications, tests, vitals)
- See AI recommendations with urgency levels
- Check confidence scores and warnings
- Add review notes

### ✏️ **Edit Mode** (Only for Reports with Confidence < 90%)
- **Add/Remove Entities**: Modify symptoms, diagnoses, medications, tests, and vitals
- **Edit Recommendations**: Update test suggestions, reasons, urgency, and confidence
- **Add New Recommendations**: Create additional recommendations
- **Manage Warnings**: Add or remove clinical warnings
- **Document Changes**: Required notes explaining edits

### 📊 **Visual Features**
- Color-coded confidence scores (Red < 80%, Yellow < 90%, Green ≥ 90%)
- Urgency indicators for recommendations
- Status badges (pending, reviewed, edited)
- Low confidence alerts
- Smooth animations with Framer Motion

## Props

```javascript
<ReportReviewModal
  isOpen={boolean}              // Controls modal visibility
  onClose={function}            // Callback when modal closes
  report={object}               // Report object from backend
  onSubmitReview={function}     // Callback for review submission
  onSubmitEdit={function}       // Callback for edit submission
/>
```

## Report Object Structure

```javascript
{
  id: "report_id",
  patient_id: "patient_id",
  pdf_filename: "report.pdf",
  uploaded_at: "2024-01-01T00:00:00Z",
  status: "pending" | "reviewed" | "edited",
  ai_analysis: {
    confidence_score: 85.5,
    entities: {
      symptoms: ["Headache", "Fever"],
      diagnoses: ["Migraine"],
      medications: ["Ibuprofen"],
      tests: ["Blood Test"],
      vitals: ["BP: 120/80"]
    },
    recommendations: [
      {
        test: "MRI Scan",
        reason: "Rule out serious conditions",
        contraindications: ["Metal implants"],
        confidence: 85,
        urgency: "high" | "medium" | "low",
        explanation: "Detailed explanation..."
      }
    ],
    warnings: ["Monitor blood pressure"]
  }
}
```

## Usage in DoctorDashboard

```javascript
import ReportReviewModal from '../components/ReportReviewModal'

const DoctorDashboard = () => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [user, setUser] = useState(null)

  // Open modal for review/edit/view
  const handleView = (reportId) => {
    const report = allReports.find(r => r.id === reportId)
    setSelectedReport(report)
    setIsReviewModalOpen(true)
  }

  // Submit review
  const handleSubmitReview = async (reportId, notes) => {
    await api.post(`/api/doctor/reports/${reportId}/review`, {
      doctor_id: user.id,
      notes: notes
    })
    fetchAllReports() // Refresh list
  }

  // Submit edits
  const handleSubmitEdit = async (reportId, editedFields, notes) => {
    await api.put(`/api/doctor/reports/${reportId}/edit`, {
      doctor_id: user.id,
      edited_fields: editedFields,
      notes: notes
    })
    fetchAllReports() // Refresh list
  }

  return (
    <>
      {/* Dashboard content */}
      
      <ReportReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false)
          setSelectedReport(null)
        }}
        report={selectedReport}
        onSubmitReview={handleSubmitReview}
        onSubmitEdit={handleSubmitEdit}
      />
    </>
  )
}
```

## Component Behavior

### Opening the Modal
- Click "View" button → Opens in view mode
- Click "Edit" button (only if confidence < 90%) → Opens in edit mode
- Click "Review" button (only if status = pending) → Opens in review mode

### Edit Mode Activation
- Available only when `ai_analysis.confidence_score < 90`
- Click "Edit Analysis" button in footer
- Shows editable fields with add/remove functionality
- Requires edit notes before submission

### Review Submission
- Available when status is "pending"
- Enter review notes (required)
- Click "Submit Review"
- Updates report status to "reviewed"
- Saves doctor review with timestamp

### Edit Submission
- Available when confidence < 90%
- Make changes to entities/recommendations
- Enter edit notes explaining changes (required)
- Click "Save Changes"
- Creates feedback record in database
- Updates report status to "edited"

## Entity Management

### Adding Items
1. Type in the input field at bottom of each section
2. Press Enter or click "Add" button
3. Item appears in the list

### Removing Items
1. Click the X icon next to any item
2. Item is removed from the list

### Recommendation Management
1. Click "+ Add Recommendation" to create new
2. Fill in test name, reason, urgency, confidence
3. Add contraindications and explanations
4. Click X in top-right to remove

## Validation Rules

### Review Submission
- ✅ Review notes must not be empty
- ✅ Report status must be "pending"
- ✅ Doctor ID must be available

### Edit Submission
- ✅ Edit notes must not be empty (explains changes)
- ✅ AI confidence must be < 90%
- ✅ Doctor ID must be available
- ✅ At least one field should be modified (not enforced but recommended)

## Backend Integration

### Review Endpoint
```
POST /api/doctor/reports/:id/review
Body: {
  "doctor_id": "doctor_object_id",
  "notes": "Review notes..."
}
Response: {
  "success": true,
  "message": "Review submitted successfully"
}
```

### Edit Endpoint
```
PUT /api/doctor/reports/:id/edit
Body: {
  "doctor_id": "doctor_object_id",
  "edited_fields": {
    "symptoms": [...],
    "diagnoses": [...],
    "medications": [...],
    "tests": [...],
    "vitals": [...],
    "recommendations": [...],
    "warnings": [...]
  },
  "notes": "Explanation of changes..."
}
Response: {
  "success": true,
  "message": "Analysis edited and feedback saved",
  "feedback_id": "feedback_object_id"
}
```

## Styling

The component uses:
- **Tailwind CSS** for utility classes
- **Custom classes** from your theme:
  - `glass-effect` - Glassmorphism cards
  - `text-gradient` - Gradient text
  - `bg-gradient-medical` - Medical theme gradient
  - `text-accent` - Accent color

## Color Coding

### Confidence Scores
- 🔴 **Red** (< 80%): Critical - requires review
- 🟡 **Yellow** (80-89%): Low - editing allowed
- 🟢 **Green** (≥ 90%): High - read-only

### Urgency Levels
- 🔴 **High**: Urgent action needed
- 🟡 **Medium**: Moderate priority
- 🟢 **Low**: Can be scheduled

### Status Badges
- 🟡 **Pending**: Awaiting doctor review
- 🟢 **Reviewed**: Doctor has reviewed
- 🔵 **Edited**: Doctor has modified analysis

## Sub-Components

### EntitySection
Displays a list of items with add/remove functionality
```javascript
<EntitySection
  title="Symptoms"
  icon={<AlertCircle />}
  items={['Headache', 'Fever']}
  color="text-red-400"
  isEditing={true}
  onAdd={(item) => handleAddItem('symptoms', item)}
  onRemove={(index) => handleRemoveItem('symptoms', index)}
/>
```

### RecommendationCard
Displays/edits a single recommendation
```javascript
<RecommendationCard
  recommendation={recommendationObject}
  index={0}
  isEditing={true}
  onUpdate={(field, value) => handleUpdate(index, field, value)}
  onRemove={() => handleRemove(index)}
/>
```

## Best Practices

1. **Always fetch user data** before opening modal (need doctor_id)
2. **Validate confidence** before allowing edits
3. **Require explanatory notes** for all changes
4. **Refresh report list** after successful submission
5. **Handle errors gracefully** with user-friendly messages
6. **Close modal** after successful operations

## Accessibility

- Keyboard navigation supported (Enter to add items)
- Focus management on inputs
- Color-blind friendly status indicators
- Screen reader compatible structure

## Performance

- Modal only renders when `isOpen` is true
- Uses `AnimatePresence` for smooth transitions
- Local state management for edits
- Minimal re-renders with React hooks

## Error Handling

```javascript
try {
  await onSubmitReview(reportId, notes)
  // Success - modal closes automatically
} catch (err) {
  console.error('Failed to submit review', err)
  // Error is thrown back to parent for handling
  // Modal stays open for user to retry
}
```

## Future Enhancements

- [ ] Auto-save draft changes
- [ ] Compare original vs edited analysis
- [ ] Upload supporting documents
- [ ] Add multimedia annotations
- [ ] Collaborative review with multiple doctors
- [ ] Version history tracking
- [ ] Print/export formatted report

## Dependencies

```json
{
  "framer-motion": "^10.16.0",
  "lucide-react": "^0.294.0",
  "react": "^18.2.0"
}
```

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ReportReviewModal.jsx  (Main component)
│   │   └── GlowButton.jsx         (Used for submit buttons)
│   └── pages/
│       └── DoctorDashboard.jsx    (Integration example)
```

---

**Note**: This component is designed for medical report review and should be used in compliance with healthcare data regulations (HIPAA, GDPR, etc.).
