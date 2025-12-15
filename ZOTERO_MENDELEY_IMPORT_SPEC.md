# 📚 Zotero & Mendeley Import Feature Specification
## ThesisAI Research Library Integration

### 🎯 **Feature Overview**

This feature enables ThesisAI users to import their existing research libraries from Zotero and Mendeley with one-click sync, bringing their collections, citations, and metadata into the ThesisAI ecosystem. This removes friction for new users coming from established reference management tools.

**Priority:** 🔴 **CRITICAL** (Week 1-2 implementation)
**Effort:** 20-25 hours
**Status:** Ready for development

---

### 🧩 **Core Functionality**

#### 1. **Zotero OAuth Integration**
- **OAuth 2.0 Flow:** Secure authentication with Zotero API
- **Permission Scopes:** Request minimal necessary permissions for citation access
- **Library Access:** Access to user's collections and items
- **Auto-Sync:** One-click import with periodic sync options

#### 2. **Mendeley API Integration**
- **OAuth 2.0 Flow:** Secure authentication with Mendeley API
- **Profile Access:** Access to user's document library
- **Metadata Import:** Full citation metadata with PDF links
- **Collection Mapping:** Preserve user's folder/collection structure

#### 3. **Data Migration & Mapping**
- **Format Conversion:** Map Zotero/Mendeley fields to ThesisAI citation schema
- **File Preservation:** Maintain PDF references and attachments
- **Collection Conversion:** Convert Zotero collections and Mendeley folders to ThesisAI groups
- **Metadata Enhancement:** Fill gaps in incomplete citation data

#### 4. **User Experience**
- **Simple Import Flow:** Single button import with progress tracking
- **Preview & Select:** Review and select which collections/libraries to import
- **Conflict Resolution:** Handle duplicate citations gracefully
- **Progress Indication:** Clear feedback during import process

---

### 🔧 **Technical Implementation**

#### **Frontend Components**
- `ZoteroImportButton.tsx`: OAuth flow initiation for Zotero
- `MendeleyImportButton.tsx`: OAuth flow initiation for Mendeley
- `ImportPreviewModal.tsx`: Review and select collections to import
- `ImportProgress.tsx`: Show real-time import progress
- Enhanced `CitationManager.tsx`: Add import functionality

#### **Backend Services**
- `zotero-oauth-handler.ts`: Handle Zotero OAuth flow and API calls
- `mendeley-oauth-handler.ts`: Handle Mendeley OAuth flow and API calls
- `citation-importer.ts`: Convert and import citation data
- `api/zotero-collections/route.ts`: Fetch Zotero collections
- `api/mendeley-documents/route.ts`: Fetch Mendeley documents
- `api/import-citations/route.ts`: Import citations to ThesisAI

#### **Database Schema Extensions**
```sql
-- Extend existing citations table to track import source
ALTER TABLE citations ADD COLUMN imported_from TEXT; -- 'zotero', 'mendeley', 'manual'
ALTER TABLE citations ADD COLUMN original_id TEXT; -- Original Zotero/Mendeley ID
ALTER TABLE citations ADD COLUMN import_date TIMESTAMP;

-- Create import history table
CREATE TABLE citation_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  source TEXT, -- 'zotero', 'mendeley'
  status TEXT, -- 'pending', 'in_progress', 'completed', 'failed'
  total_items INT,
  imported_items INT,
  metadata JSONB, -- Additional import metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create library groups table for imported collections
CREATE TABLE library_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  source TEXT, -- 'zotero_collection', 'mendeley_folder', 'thesisai'
  source_id TEXT, -- Original Zotero/Mendeley ID
  created_at TIMESTAMP DEFAULT NOW()
);

-- Link citations to groups
CREATE TABLE citation_groups (
  citation_id UUID REFERENCES citations(id),
  group_id UUID REFERENCES library_groups(id),
  PRIMARY KEY (citation_id, group_id)
);
```

---

### 🎨 **UI/UX Design**

#### **Import Flow**
```
┌─────────────────────────────────────────────────────────┐
│  Import Your Research Library                           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌─────────────────┐              │
│  │    Connect      │   │   Connect       │              │
│  │    Zotero       │   │   Mendeley      │              │
│  │                 │   │                 │              │
│  │  [Connect]      │   │  [Connect]      │              │
│  └─────────────────┘   └─────────────────┘              │
│                                                         │
│  Or import from file: [Choose File] (.bib, .ris, .csv) │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Preview Modal**
```
┌─────────────────────────────────────────────────────────┐
│  Import from Zotero - Review & Select                  │
│  [×]                                                     │
├─────────────────────────────────────────────────────────┤
│  You're connected to your Zotero account               │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Libraries to Import:                                │ │
│  │                                                     │ │
│  │ ☑️  My Library (24 items)                          │ │
│  │ ☑️  Research Papers (45 items)                     │ │
│  │ ☑️  Thesis Sources (67 items)                      │ │
│  │ ☐  Personal Notes (5 items)                        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  [Import Selected] [Select All] [Cancel]               │
└─────────────────────────────────────────────────────────┘
```

#### **Progress Indicator**
```
Importing citations... (120/156)
┌─────────────────────────────────────┐
│███████████████████░░░░░░░░░░░░░░░░░░│ 77%
└─────────────────────────────────────┘
Status: Processing "The Impact of AI on Education"...
```

---

### 🔐 **Security & Privacy Considerations**

- **Minimal Permissions:** Only request access to citation data, not personal information
- **Secure Storage:** Store OAuth tokens encrypted in database
- **Data Privacy:** All imported data remains private to user account
- **Revocation:** Provide easy way to disconnect services
- **Compliance:** Follow OAuth 2.0 best practices and service-specific requirements

---

### 🔌 **API Integration Details**

#### **Zotero API Integration**
- **Endpoint:** `https://api.zotero.org/`
- **Authentication:** OAuth 2.0 with Zotero-specific scopes
- **Rate Limits:** Respect Zotero API rate limits (10 requests/second)
- **Endpoints:**
  - `GET /users/{user_id}/libraries` - List user libraries
  - `GET /users/{user_id}/items` - Get citation items
  - `GET /users/{user_id}/collections` - Get collections

#### **Mendeley API Integration**
- **Endpoint:** `https://api.mendeley.com/`
- **Authentication:** OAuth 2.0
- **Rate Limits:** Respect Mendeley API rate limits
- **Endpoints:**
  - `GET /documents` - Get user documents
  - `GET /folders` - Get user folders
  - `GET /annotations` - Get document annotations

---

### 🔄 **Data Mapping Schema**

#### **Zotero to ThesisAI Citation Mapping**
```javascript
zoteroItem: {
  key: "original_id",
  itemType: "type", 
  title: "title",
  creators: "authors", // Convert array of objects to simple array
  date: "date",
  DOI: "doi",
  ISBN: "isbn", 
  publicationTitle: "journal",
  volume: "volume",
  issue: "issue",
  pages: "pages",
  url: "url",
  abstractNote: "abstract",
  tags: "tags",
  collections: "group_ids"
}
```

#### **Mendeley to ThesisAI Citation Mapping**
```javascript
mendeleyDocument: {
  id: "original_id",
  title: "title",
  authors: "authors",
  year: "date",
  doi: "doi",
  isbn: "isbn",
  journal: "journal",
  volume: "volume",
  issue: "issue",
  pages: "pages",
  source_url: "url",
  abstract: "abstract",
  keywords: "tags",
  folder_ids: "group_ids"
}
```

---

### 🧪 **Testing Strategy**

#### **Unit Tests**
- OAuth flow handling for both services
- Data transformation and mapping functions
- Error handling for API failures
- Duplicate detection algorithms

#### **Integration Tests**
- Complete import flow from OAuth to database
- Collection/folder preservation
- PDF attachment handling
- Progress tracking accuracy

#### **User Acceptance Tests**
- Real Zotero/Mendeley accounts import
- Large library handling (>1000 citations)
- Conflict resolution with existing citations
- Import cancellation and resumption

---

### 🚀 **Implementation Plan**

#### **Phase 1: OAuth Infrastructure (Days 1-3)**
- Implement Zotero OAuth flow
- Implement Mendeley OAuth flow
- Create secure token storage

#### **Phase 2: API Integration (Days 4-7)**
- Fetch Zotero collections and items
- Fetch Mendeley documents and folders
- Implement data mapping functions

#### **Phase 3: UI Components (Days 8-10)**
- Create import buttons and modals
- Build preview and selection UI
- Add progress indicators

#### **Phase 4: Integration & Testing (Days 11-14)**
- Connect frontend to backend services
- Test with real accounts
- Refine user experience

---

### 📊 **Success Metrics**

- **Adoption Rate:** Track users importing from external services
- **Import Success:** Percentage of successful vs failed imports
- **User Satisfaction:** Feedback on import process quality
- **Time Savings:** Reduction in manual citation entry time
- **Library Growth:** Increase in citation collection size post-import

---

### 🚨 **Potential Challenges**

1. **API Limitations:** Both services have rate limits and potential restrictions
2. **Data Quality:** Imported citations may have inconsistent quality
3. **File Attachments:** PDF sync may not be possible due to security restrictions
4. **Sync Complexity:** Real-time sync may be complex to implement and maintain
5. **User Expectations:** Users may expect full feature parity with source tools

---

### 🔄 **Future Enhancements**

- **Scheduled Sync:** Automatic periodic updates from Zotero/Mendeley
- **Two-way Sync:** Sync changes back to Zotero/Mendeley
- **File Attachment Sync:** Sync PDF files across platforms
- **Annotation Import:** Import highlights and notes
- **Multi-account Support:** Connect multiple Zotero/Mendeley accounts

---

*This specification provides a comprehensive roadmap for implementing the Zotero & Mendeley import feature. The implementation should maintain academic citation standards while providing a smooth migration path for users.*