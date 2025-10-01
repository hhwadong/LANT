# LANT-v3 Testing Checklist

This comprehensive checklist ensures all features work correctly before releasing updates or contributing to the project.

## 🏠 **Core Application Features**

### **1. Application Startup & Initial State**
- [ ] App loads without console errors
- [ ] Sidebar is CLOSED by default on initial load
- [ ] Landing page is the chat interface
- [ ] Theme (light/dark) works correctly
- [ ] All icons and UI elements render properly

### **2. Sidebar Functionality**
- [ ] Toggle button opens/closes sidebar
- [ ] Sidebar state persists across page refresh
- [ ] All sections expand/collapse correctly (Workspace, Sessions, Documents, Tools, Model)
- [ ] No navigation button in top nav (dashboard removed)

## 📚 **Lecture Management**

### **3. Create Lectures**
- [ ] "+" button in Workspace section creates new lecture
- [ ] Prompt dialog appears and accepts input
- [ ] New lecture appears in sidebar list
- [ ] Lecture can be selected by clicking
- [ ] Active lecture is highlighted visually

### **4. Delete Lectures**
- [ ] Right-click or "..." menu shows delete option
- [ ] Confirmation dialog appears with correct lecture name
- [ ] Deletion works and removes lecture from list
- [ ] All associated sessions are also deleted
- [ ] If active lecture is deleted, selection is cleared

### **5. Rename Lectures**
- [ ] Right-click or "..." menu shows rename option
- [ ] Rename dialog appears with current name
- [ ] Rename works and updates the list
- [ ] If active lecture is renamed, selection updates

## 💬 **Session Management**

### **6. Create Sessions**
- [ ] "+" button in Sessions section creates new session (when lecture selected)
- [ ] Error appears when trying to create session without selecting lecture
- [ ] Auto-generated session names work when leaving field empty
- [ ] Custom session names work when provided
- [ ] New session appears in session list

### **7. Delete Sessions**
- [ ] Right-click or "..." menu shows delete option for sessions
- [ ] Confirmation dialog appears with correct session name
- [ ] Deletion works and removes session from list
- [ ] If active session is deleted, selection is cleared

### **8. Rename Sessions**
- [ ] Right-click or "..." menu shows rename option for sessions
- [ ] Rename dialog appears with current name
- [ ] Rename works and updates the list
- [ ] If active session is renamed, selection updates

## 📄 **Document Management**

### **9. Document Upload**
- [ ] Upload area appears in Documents section (when lecture selected)
- [ ] Error appears when trying to upload without selecting lecture
- [ ] Drag & drop functionality works
- [ ] Click to browse files works
- [ ] Multiple file upload works
- [ ] Supported file types: PDF, PPT/PPTX, DOCX, TXT, MD, PNG, JPG, JPEG, BMP, TIFF, GIF
- [ ] Upload success message appears
- [ ] Files are actually processed and stored

## 🤖 **AI Chat Functionality**

### **10. Basic Chat**
- [ ] Chat interface loads when session is selected
- [ ] Messages are displayed correctly
- [ ] Input field accepts text
- [ ] Send button works
- [ ] Enter key sends message
- [ ] AI responses appear and are formatted correctly

### **11. Message Persistence**
- [ ] Messages are saved when switching between sessions
- [ ] Messages persist when switching between lectures
- [ ] Messages reappear when returning to a session
- [ ] Each session has independent message history

### **12. Conversation Clearing**
- [ ] Clear conversation button in Tools section works
- [ ] Confirmation dialog appears
- [ ] All messages are cleared from current session
- [ ] Other sessions are unaffected

## 🛠️ **Tools Features**

### **13. Question Generation**
- [ ] "Questions" button works when lecture and session selected
- [ ] Error appears when no lecture/session selected
- [ ] Questions are generated and displayed in dialog
- [ ] Questions are relevant to the session content
- [ ] Dialog can be closed properly

### **14. Conversation Summary**
- [ ] "Summary" button works when lecture and session selected
- [ ] Error appears when no lecture/session selected
- [ ] Summary is generated and displayed in dialog
- [ ] Summary is relevant to the session content
- [ ] Dialog can be closed properly

### **15. Session Merging**
- [ ] "Merge" button works when lecture is selected
- [ ] Merge dialog appears with session list
- [ ] Multiple sessions can be selected with checkboxes
- [ ] Error appears when fewer than 2 sessions selected
- [ ] Merge creates new combined session
- [ ] Original sessions remain intact
- [ ] New session contains messages from all selected sessions

## ⚙️ **Settings & Configuration**

### **16. AI Model Selection**
- [ ] Model dropdown in sidebar shows all available models
- [ ] Model can be changed successfully
- [ ] Model preference persists across page refresh
- [ ] Model change affects AI responses

### **17. Model Parameters**
- [ ] Settings panel opens correctly
- [ ] Temperature parameter can be adjusted
- [ ] Top-p parameter can be adjusted
- [ ] Num_predict parameter can be adjusted
- [ ] Parameters persist across page refresh
- [ ] Settings apply to AI conversations

### **18. Theme Switching**
- [ ] Theme toggle button in top nav works
- [ ] Light and dark themes apply correctly
- [ ] Theme preference persists across page refresh
- [ ] All UI elements look good in both themes

## 🧹 **Maintenance Features**

### **19. Cache Clearing**
- [ ] "Clear Cache" button in sidebar footer works
- [ ] Confirmation dialog appears
- [ ] Cache is cleared successfully
- [ ] Success message appears

## 🌐 **Web Application Features**

### **20. Responsive Design**
- [ ] App works on desktop screens
- [ ] App works on tablet screens
- [ ] App works on mobile screens
- [ ] UI elements scale appropriately
- [ ] No horizontal scrolling required

### **21. Browser Compatibility**
- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

### **22. Error Handling**
- [ ] Network errors are handled gracefully
- [ ] API errors show user-friendly messages
- [ ] File upload errors are handled
- [ ] No console errors during normal operation

## 📊 **Data Integrity**

### **23. Data Persistence**
- [ ] Lectures persist across page refresh
- [ ] Sessions persist across page refresh
- [ ] Documents persist across page refresh
- [ ] Chat history persists across page refresh
- [ ] Settings persist across page refresh

### **24. Data Isolation**
- [ ] Different lectures don't interfere with each other
- [ ] Different sessions don't interfere with each other
- [ ] Deleting a lecture doesn't affect other lectures
- [ ] Clearing conversation doesn't affect other sessions

## 🎯 **Edge Cases**

### **25. Empty States**
- [ ] App shows appropriate empty state when no lectures exist
- [ ] App shows appropriate empty state when no sessions exist
- [ ] App shows appropriate empty state when no documents exist
- [ ] App shows appropriate empty state when no messages exist

### **26. Error Recovery**
- [ ] App recovers from failed API calls
- [ ] App handles network interruptions gracefully
- [ ] App handles invalid file uploads gracefully
- [ ] App handles AI model failures gracefully

---

## 📝 **Testing Instructions**

### **Before Each Test Session**

1. **Clear browser cache and cookies**
2. **Restart the application**
3. **Check browser console for errors**

### **Testing Order**

Go through each section systematically from top to bottom.

### **Theme Testing**

After completing each section in one theme, switch themes and test again:
1. Complete all tests in light mode
2. Switch to dark mode
3. Repeat critical tests (core features)
4. Verify UI looks good in dark mode

### **Persistence Testing**

After each feature test:
1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Verify the feature still works**
3. **Check that data is preserved**

### **Isolation Testing**

1. **Create multiple lectures and sessions**
2. **Test that actions in one don't affect others**
3. **Delete items and verify others remain intact**

### **Performance Testing**

1. **Test with large amounts of data**
2. **Test with large file uploads**
3. **Monitor memory usage and performance**

### **Security Testing**

1. **Test file upload restrictions**
2. **Verify no sensitive data in console/logs**
3. **Test input validation and sanitization**

## 🐛 **Bug Reporting Template**

When filing issues, use this template:

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 14.0, Windows 11, Ubuntu 22.04]
- Browser: [e.g., Chrome 119, Firefox 120, Safari 17]
- Python Version: [e.g., 3.11.0]
- Node.js Version: [e.g., 18.18.0]

## Console Errors
```
Paste any console errors here
```

## Screenshots
Add screenshots if applicable
```

---

**Remember**: Quality is everyone's responsibility. Take pride in your work and ensure each contribution meets the high standards of the LANT-v3 project.