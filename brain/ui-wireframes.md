# Intellibase Chat - UI Wireframes & Component Structure

## Overall Layout

### Main Application Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | Knowledge Base Selector | Settings      │
├─────────────────────────────────────────────────────────┤
│ Sidebar          │ Main Content Area                    │
│ - Knowledge      │ ┌─────────────────────────────────┐ │
│   Bases          │ │ Chat Interface                   │ │
│ - Documents      │ │ - Message History                │ │
│ - Conversations  │ │ - Input Field                    │ │
│ - Settings       │ │ - Send Button                    │ │
│                  │ └─────────────────────────────────┘ │
│                  │ ┌─────────────────────────────────┐ │
│                  │ │ Document Upload Area            │ │
│                  │ │ - Drag & Drop Zone              │ │
│                  │ │ - File List                     │ │
│                  │ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### 1. App Layout Components
```
App
├── Header
│   ├── Logo
│   ├── KnowledgeBaseSelector
│   └── UserMenu
├── Sidebar
│   ├── Navigation
│   │   ├── KnowledgeBases
│   │   ├── Documents
│   │   ├── Conversations
│   │   └── Settings
│   └── KnowledgeBaseList
└── MainContent
    ├── ChatInterface
    ├── DocumentUpload
    └── DocumentLibrary
```

### 2. Chat Interface Components
```
ChatInterface
├── MessageList
│   ├── Message (User)
│   │   ├── Avatar
│   │   ├── Content
│   │   └── Timestamp
│   └── Message (Assistant)
│       ├── Avatar
│       ├── Content
│       ├── Sources
│       └── Timestamp
├── MessageInput
│   ├── TextArea
│   ├── SendButton
│   └── AttachButton
└── TypingIndicator
```

### 3. Document Management Components
```
DocumentUpload
├── DropZone
│   ├── UploadIcon
│   ├── UploadText
│   └── FileInput
├── FileList
│   ├── FileItem
│   │   ├── FileIcon
│   │   ├── FileName
│   │   ├── FileSize
│   │   ├── Status
│   │   └── DeleteButton
│   └── ProgressBar
└── UploadButton
```

## Key UI States

### 1. Empty State (No Knowledge Base)
```
┌─────────────────────────────────────────┐
│              🚀 Welcome!                │
│                                         │
│    Create your first knowledge base     │
│    to get started with AI chat          │
│                                         │
│    [Create Knowledge Base]              │
└─────────────────────────────────────────┘
```

### 2. Empty Knowledge Base
```
┌─────────────────────────────────────────┐
│         📚 Your Knowledge Base          │
│                                         │
│    Upload documents to create your      │
│    AI-powered chatbot                   │
│                                         │
│    [Upload Documents]                   │
│                                         │
│    Supported formats: PDF, DOCX, TXT    │
└─────────────────────────────────────────┘
```

### 3. Chat Interface
```
┌─────────────────────────────────────────┐
│ Chat with your knowledge base           │
├─────────────────────────────────────────┤
│                                         │
│  👤 What is the main topic of this     │
│     document?                           │
│                                         │
│  🤖 Based on the uploaded document,     │
│     the main topic appears to be...     │
│                                         │
│     📄 Sources: document.pdf (p. 1)     │
│                                         │
│  👤 [Type your question...] [Send]      │
└─────────────────────────────────────────┘
```

### 4. Document Upload
```
┌─────────────────────────────────────────┐
│ Upload Documents                        │
├─────────────────────────────────────────┤
│                                         │
│    📁 Drag & drop files here            │
│    or click to browse                   │
│                                         │
│    Max file size: 10MB                  │
│    Supported: PDF, DOCX, TXT, MD        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 document.pdf (2.3MB) ✅          │ │
│ │ 📄 report.docx (1.8MB) ⏳           │ │
│ │ 📄 notes.txt (0.5MB) ❌             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Upload All] [Clear All]                │
└─────────────────────────────────────────┘
```

## Responsive Design

### Mobile Layout (< 768px)
```
┌─────────────────┐
│ ☰ Logo          │
├─────────────────┤
│                 │
│ Chat Interface  │
│                 │
│ [Upload] [Docs] │
│                 │
└─────────────────┘
```

### Tablet Layout (768px - 1024px)
```
┌─────────────────────────────┐
│ Logo | Knowledge Base | ⚙️  │
├─────────────────────────────┤
│ Sidebar │ Main Content      │
│ - Docs  │ Chat Interface    │
│ - Chat  │                   │
│         │                   │
└─────────────────────────────┘
```

## Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: White (#FFFFFF) / Dark (#1F2937)
- **Text**: Gray-900 (#111827) / Gray-100 (#F3F4F6)

### Typography
- **Headings**: Inter, 600 weight
- **Body**: Inter, 400 weight
- **Code**: JetBrains Mono, 400 weight

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Components
- **Buttons**: Rounded corners, hover states
- **Cards**: Subtle shadows, rounded corners
- **Inputs**: Focus states, validation styling
- **Messages**: Bubbles with proper spacing
- **Icons**: Heroicons or Lucide React
