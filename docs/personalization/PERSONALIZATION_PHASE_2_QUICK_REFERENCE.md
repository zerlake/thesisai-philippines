# Phase 2 Quick Reference - Tests & Components

## Test Files Location
```
src/__tests__/personalization/
├── user-preferences.test.ts       ← Preference CRUD & caching
├── cross-device-sync.test.ts      ← Device sync & conflicts
├── smart-notifications.test.ts    ← Notification priorities & timing
├── adaptive-interface.test.ts     ← Behavior patterns & suggestions
└── dashboard-customization.test.ts ← Widget management
```

## Running Tests

```bash
# All personalization tests
npm test personalization

# Specific test file
npm test user-preferences.test.ts

# With coverage
npm test -- --coverage personalization

# Watch mode
npm test -- --watch personalization
```

## Component Files Location
```
src/components/personalization/
├── settings-page.tsx              ← Main settings container (6 tabs)
├── notification-center.tsx        ← Notification management UI
└── preference-panels/
    ├── theme-settings.tsx         ← Colors, fonts, theme mode
    ├── notification-settings.tsx  ← Channels, quiet hours, batching
    ├── accessibility-settings.tsx ← Vision, motion, keyboard, SR
    ├── layout-settings.tsx        ← Sidebar, view type, compact
    ├── privacy-settings.tsx       ← Data collection, export, delete
    └── device-management.tsx      ← Devices, sync, trust
```

## Component Quick Links

### Main Page
```typescript
import SettingsPage from '@/components/personalization/settings-page';
<SettingsPage />
```

### Notifications
```typescript
import NotificationCenter from '@/components/personalization/notification-center';
<NotificationCenter />
```

### Individual Panels
```typescript
import ThemeSettings from '@/components/personalization/preference-panels/theme-settings';
import NotificationSettings from '@/components/personalization/preference-panels/notification-settings';
import AccessibilitySettings from '@/components/personalization/preference-panels/accessibility-settings';
import LayoutSettings from '@/components/personalization/preference-panels/layout-settings';
import PrivacySettings from '@/components/personalization/preference-panels/privacy-settings';
import DeviceManagement from '@/components/personalization/preference-panels/device-management';
```

## Test Command Reference

```bash
# Run all tests
npm test

# Run personalization tests only
npm test personalization

# Run specific suite
npm test -- user-preferences.test.ts
npm test -- cross-device-sync.test.ts
npm test -- smart-notifications.test.ts
npm test -- adaptive-interface.test.ts
npm test -- dashboard-customization.test.ts

# Watch mode (auto-rerun on changes)
npm test -- --watch personalization

# Coverage report
npm test -- --coverage personalization

# Verbose output
npm test -- --reporter=verbose personalization
```

## What Each Test Suite Covers

### `user-preferences.test.ts` (9 tests)
```
✓ getCachedPreferences - Returns defaults or cached data
✓ updatePreferences - Merges preferences correctly
✓ Cache timestamp - Updates on change
✓ resetToDefaults - Full reset works
✓ updateTheme - Theme updates only
✓ updateNotifications - Notifications update only
✓ Cache TTL - Validates expiry
✓ Cache validity - Checks within TTL
✓ Cache invalidation - Expires after 5 min
```

### `cross-device-sync.test.ts` (10 tests)
```
✓ registerDevice - Creates new device
✓ No duplicates - Prevents device duplication
✓ trackChange - Records preference changes
✓ Unsynced status - Changes marked as unsynced
✓ detectConflicts - Finds conflicts between devices
✓ Ignore different sections - No false conflicts
✓ Timestamp resolution - Latest timestamp wins
✓ User preference resolution - Preferred device wins
✓ Merge resolution - Combines compatible changes
✓ Sync status - Marks changes as synced
```

### `smart-notifications.test.ts` (10 tests)
```
✓ calculatePriority - Computes 1-5 priority
✓ Type weighting - Alerts > Features
✓ User preferences - Impacts priority
✓ Optimal time - Returns current if active
✓ Quiet hours - Delays if in quiet window
✓ Channel selection - Filters by preferences
✓ Enabled channels only - Respects toggles
✓ Disabled notifications - Returns empty
✓ Create notification - With priority
✓ Delivery channels - Includes appropriate channels
✓ Notification batching - Groups if enabled
✓ No batching - Sends immediately if disabled
```

### `adaptive-interface.test.ts` (12 tests)
```
✓ logBehavior - Records user events
✓ Duration tracking - Logs event duration
✓ Event categorization - Groups by type
✓ detectPatterns - Finds usage patterns
✓ Calculate frequency - Ranks by usage
✓ Confidence scoring - High confidence on repeat
✓ customizationLevel - Computes 0-1 score
✓ New users - Low customization initially
✓ Diverse usage - Increases customization
✓ suggestActions - Creates suggestions
✓ Prioritize suggestions - Orders by priority
✓ Feature discovery - Tracks discovered features
✓ adaptiveConfiguration - Generates based on patterns
```

### `dashboard-customization.test.ts` (15 tests)
```
✓ Create widget - With ID generation
✓ Get widget - Retrieves by ID
✓ Update widget - Modifies properties
✓ Delete widget - Removes widget
✓ Reorder widgets - Changes order
✓ Rearrange widgets - Updates positions
✓ Widget settings - Updates per widget
✓ Refresh interval - Validates timing
✓ Create preset - Saves layout
✓ Default layout - Sets as default
✓ Load preset - Retrieves saved layout
✓ Responsive layout - Mobile/desktop variants
✓ Export config - Exports as JSON
✓ Import config - Loads from JSON
✓ Validate import - Rejects invalid configs
```

## Component Feature Matrix

| Feature | Theme | Notif | Access | Layout | Privacy | Device | Notif Center |
|---------|-------|-------|--------|--------|---------|--------|--------------|
| Dark Mode | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mobile Responsive | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Real-time Preview | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Keyboard Nav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loading States | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Error Handling | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Accessibility | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| API Integration | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

Legend: ✓ = Done, ✗ = N/A, ⏳ = Phase 3

## Hooks Used by Components

```typescript
// All components use:
usePersonalization()       // Get/update preferences
useSmartNotifications()    // Get/manage notifications
useDashboardCustomization() // Widget management

// Individual usage:
ThemeSettings        → usePersonalization()
NotificationSettings → usePersonalization()
AccessibilitySettings → usePersonalization()
LayoutSettings       → usePersonalization()
PrivacySettings      → usePersonalization()
DeviceManagement     → [Custom fetch calls]
NotificationCenter   → useSmartNotifications()
```

## Key Props & State

### All Panels
```typescript
{
  preferences: UserPreferences
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>
  isLoading: boolean
}
```

### NotificationCenter
```typescript
{
  notifications: Notification[]
  isLoading: boolean
  markAsRead: (ids: string[]) => Promise<void>
  deleteNotification: (ids: string[]) => Promise<void>
}
```

## Testing Strategy

### Unit Test Structure
```typescript
describe('Manager', () => {
  let manager: Manager;
  
  beforeEach(() => {
    manager = new Manager('test-user');
  });

  describe('Feature', () => {
    it('should do something', () => {
      // Arrange
      const input = { /* ... */ };
      
      // Act
      const result = manager.method(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## Common Test Patterns

### Testing Async Operations
```typescript
it('should create item', async () => {
  const result = await manager.create(data);
  expect(result.id).toBeDefined();
});
```

### Testing Validation
```typescript
it('should reject invalid input', async () => {
  const result = await manager.update(invalidData).catch(e => e);
  expect(result).toBeInstanceOf(Error);
});
```

### Testing State Changes
```typescript
it('should update internal state', async () => {
  await manager.operation();
  const state = manager.getState();
  expect(state).toEqual(expected);
});
```

## Debugging Tests

```bash
# Run with detailed output
npm test -- --verbose personalization

# Run single test only
npm test -- -t "should create widget"

# Run tests matching pattern
npm test -- -t "widget"

# Debug in Node inspector
node --inspect-brk ./node_modules/.bin/jest personalization

# Generate coverage report
npm test -- --coverage personalization --coverageReporters=html
```

## Coverage Goals

| Metric | Target | Status |
|--------|--------|--------|
| Statements | 75%+ | ✓ |
| Branches | 70%+ | ✓ |
| Functions | 75%+ | ✓ |
| Lines | 75%+ | ✓ |

## Phase 3 Preview

### API Integration Needed
```
POST /api/personalization/preferences      ← Update theme, notifications
POST /api/personalization/devices          ← Register/manage devices
POST /api/personalization/sync              ← Sync changes
POST /api/personalization/notifications    ← Get/update notifications
PATCH /api/personalization/dashboard       ← Save layouts
```

### WebSocket Events
```
preferences:updated    → Sync across tabs
notification:received  → New notification
sync:conflict         → Handle conflict
device:registered     → New device joined
```

## Troubleshooting

### Tests failing
1. Check test dependencies installed: `npm install --save-dev vitest @vitest/ui`
2. Ensure correct import paths
3. Check timezone for time-based tests
4. Verify mock data matches schema

### Components not rendering
1. Verify UI component imports exist
2. Check hook imports are correct
3. Ensure CSS classes are available
4. Check for TypeScript errors

### API not connecting
1. Verify API endpoints exist
2. Check authentication headers
3. Ensure session is valid
4. Check CORS configuration

---

**Quick Links**:
- 📝 [Phase 2 Full Report](./PERSONALIZATION_IMPLEMENTATION_PHASE_2_COMPLETE.md)
- 🔗 [Phase 1 Summary](./PERSONALIZATION_IMPLEMENTATION_PHASE_1_COMPLETE.md)
- 📚 [Full Documentation](./PERSONALIZATION_ADAPTATION_GUIDE.md)
