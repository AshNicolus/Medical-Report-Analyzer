# Report Summary Component - User Guide

## 🎯 Overview
The **ReportSummary** component displays AI-analyzed medical report data in a beautiful, hierarchical, tabular format with collapsible sections.

## 📋 Component Features

### 1. **Three-Level Hierarchy Structure**

#### **Main Title (Level 1)** - Section Headers
- Extracted Medical Entities
- AI Recommendations  
- Warnings & Alerts

#### **Subtitle (Level 2)** - Category Rows
Within "Extracted Entities":
- Symptoms
- Diagnoses
- Medications
- Tests Performed
- Vital Signs
- Severity Indicators
- Urgency Level

#### **Details (Level 3)** - Individual Items
Each category shows specific items as color-coded tags with counts.

### 2. **Interactive Dropdown Design**
- Click section headers to expand/collapse
- Smooth animations using Framer Motion
- Chevron icons indicate expand state
- Default: Entities & Recommendations expanded, Warnings collapsed

### 3. **Tabular Format**

#### **Entities Table Columns:**
| Category | Items Found | Count |
|----------|-------------|-------|
| Icon + Name | Color-coded tags | Number |

#### **Recommendations Table Columns:**
| Test/Action | Reason | Urgency | Confidence |
|-------------|--------|---------|------------|
| Test name + explanation | Why needed + contraindications | Priority badge | Percentage |

### 4. **Visual Hierarchy**

```
┌─────────────────────────────────────────────────┐
│ 📄 Analysis Summary                    95.2% ✕ │  ← Header (Gradient)
├─────────────────────────────────────────────────┤
│                                                 │
│ ▼ 🔬 Extracted Medical Entities    [6 cat.]   │  ← Main Title (Expandable)
│ ┌───────────────────────────────────────────┐ │
│ │ Category    │ Items Found        │ Count │ │  ← Table Headers
│ ├───────────────────────────────────────────┤ │
│ │ 🌡️ Symptoms  │ [fever] [cough]   │   2   │ │  ← Subtitle Row
│ │ ⚡ Diagnoses │ [flu]             │   1   │ │  ← Subtitle Row
│ │ 💊 Meds     │ [aspirin]         │   1   │ │  ← Subtitle Row
│ └───────────────────────────────────────────┘ │
│                                                 │
│ ▼ ✅ AI Recommendations           [3 items]   │  ← Main Title
│ ┌───────────────────────────────────────────┐ │
│ │ Test   │ Reason    │ Urgency │ Confidence│ │  ← Table Headers
│ ├───────────────────────────────────────────┤ │
│ │ X-Ray  │ Check...  │  HIGH   │   92%    │ │  ← Detail Row
│ └───────────────────────────────────────────┘ │
│                                                 │
│ ▶ ⚠️  Warnings & Alerts            [1 alert]  │  ← Main Title (Collapsed)
│                                                 │
├─────────────────────────────────────────────────┤
│ 💡 AI-generated disclaimer          [Close]   │  ← Footer
└─────────────────────────────────────────────────┘
```

## 🎨 Color Coding System

### Entity Categories:
- 🌡️ **Symptoms**: Orange (`bg-orange-500/10 text-orange-400`)
- ⚡ **Diagnoses**: Red (`bg-red-500/10 text-red-400`)
- 💊 **Medications**: Blue (`bg-blue-500/10 text-blue-400`)
- 🧪 **Tests**: Purple (`bg-purple-500/10 text-purple-400`)
- 📈 **Vitals**: Green (`bg-green-500/10 text-green-400`)
- ⚠️  **Severity**: Yellow (`bg-yellow-500/10 text-yellow-400`)
- ℹ️  **Urgency**: Cyan (`bg-cyan-500/10 text-cyan-400`)

### Urgency Levels:
- 🔴 **High**: Red
- 🟡 **Medium**: Yellow
- 🟢 **Low**: Green
- 🔵 **Routine**: Blue

### Confidence Scores:
- ✅ **90%+**: Green (High confidence)
- ⚡ **75-89%**: Yellow (Medium confidence)
- ⚠️  **<75%**: Red (Low confidence)

## 🚀 User Flow

### After Upload:
1. Patient uploads PDF report
2. Backend analyzes and returns data
3. **Summary modal opens automatically** ✨
4. Shows confidence score in header
5. Three expandable sections display

### From Report List:
1. Hover over any report card
2. Click the **purple document icon** 📄
3. Summary modal opens with that report's data

## 📊 Data Structure

The component expects this analysis data format:

```javascript
{
  confidence_score: 94.5,
  entities: {
    symptoms: ["fever", "cough", "fatigue"],
    diagnoses: ["influenza"],
    medications: ["aspirin", "rest"],
    tests: ["blood test", "throat swab"],
    vitals: ["temp: 101°F", "BP: 120/80"],
    severity: ["moderate"],
    urgency: ["routine"]
  },
  recommendations: [
    {
      test: "Chest X-Ray",
      reason: "Rule out pneumonia",
      urgency: "medium",
      confidence: 87.5,
      explanation: "Based on persistent cough",
      contraindications: ["pregnancy"]
    }
  ],
  warnings: [
    "Elevated temperature requires monitoring"
  ]
}
```

## 🎭 Component Props

```typescript
interface ReportSummaryProps {
  isOpen: boolean          // Show/hide modal
  onClose: () => void      // Close callback
  analysisData: {          // AI analysis object
    confidence_score: number
    entities: object
    recommendations: array
    warnings: array
  }
  reportName?: string      // Report filename/title
}
```

## 💡 Key Features

### 1. **Smart Empty States**
- Shows "No entities extracted" if category is empty
- Shows "No recommendations available" if none exist
- Only displays non-empty categories

### 2. **Responsive Design**
- Full width on mobile
- Max 5xl width on desktop
- 90vh max height with scroll
- Glass-morphism effects

### 3. **Accessibility**
- Click anywhere outside to close
- X button in top-right
- Close button in footer
- Keyboard navigation support

### 4. **Animations**
- Modal fade in/out
- Scale animation on open
- Smooth height transitions on expand/collapse
- Hover effects on rows

## 🎯 Integration Example

```jsx
import ReportSummary from '../components/ReportSummary'

function PatientDashboard() {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)

  const handleViewSummary = (report) => {
    setCurrentAnalysis(report.analysis)
    setSelectedReport(report)
    setIsSummaryOpen(true)
  }

  return (
    <>
      <button onClick={() => handleViewSummary(report)}>
        View Summary
      </button>

      <ReportSummary
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        analysisData={currentAnalysis}
        reportName={selectedReport?.name}
      />
    </>
  )
}
```

## 📱 User Actions

### Primary Actions:
- **View Details**: Click section header to expand
- **Hide Details**: Click expanded header to collapse
- **Close Modal**: Click X, Close button, or outside modal

### Visual Feedback:
- Hover effects on table rows
- Color-coded urgency badges
- Confidence score color coding
- Section badges show item counts
- Icons indicate content type

## 🔧 Customization Options

### Easy to modify:
1. **Colors**: Change urgency/confidence color functions
2. **Icons**: Swap Lucide React icons
3. **Layout**: Adjust table columns
4. **Animations**: Modify Framer Motion props
5. **Default State**: Change initial `expandedSections`

## 📋 Testing Checklist

- [ ] Opens after PDF upload
- [ ] All sections expand/collapse
- [ ] Color coding correct for urgency
- [ ] Confidence scores display properly
- [ ] Empty states show when no data
- [ ] Warnings section appears when needed
- [ ] Modal closes correctly
- [ ] Responsive on mobile
- [ ] Smooth animations work
- [ ] Can view multiple reports

## 🌟 Best Practices

1. **Always provide `analysisData`** - Component handles null gracefully
2. **Include `reportName`** - Better UX with context
3. **Store analysis in report object** - For later viewing
4. **Auto-open after upload** - Immediate feedback
5. **Keep data structure consistent** - Follow backend format

## 🐛 Troubleshooting

**Modal won't open:**
- Check `isOpen` prop is true
- Verify `analysisData` is not null

**Data not displaying:**
- Check data structure matches expected format
- Verify entity arrays have items
- Check console for errors

**Styling issues:**
- Ensure Tailwind classes compiled
- Verify Framer Motion installed
- Check z-index conflicts

## 📚 Related Components

- **AIChatBot** - For asking questions about reports
- **PatientDashboard** - Main container
- **GlowButton** - UI elements

## 🎓 Summary

This component provides a **professional, medical-grade interface** for displaying AI analysis results with:
- Clear visual hierarchy (3 levels)
- Interactive expand/collapse
- Color-coded categories
- Tabular data presentation
- Smooth animations
- Responsive design

Perfect for presenting complex medical data in an easy-to-understand format! 🏥✨
