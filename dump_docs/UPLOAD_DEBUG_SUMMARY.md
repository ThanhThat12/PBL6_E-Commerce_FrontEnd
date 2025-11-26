# Upload Error Debug - 500 Internal Server Error

## Lỗi hiện tại

```
POST http://localhost:8081/api/products/43/images/main 500 (Internal Server Error)
POST http://localhost:8081/api/products/43/images/variant?attributeValue=Xanh 500 (Internal Server Error)
```

## Debug Steps Added

### 1. **Enhanced Error Logging**
- ✅ Added detailed console logs for each upload type
- ✅ Added individual error messages for each upload failure  
- ✅ Added debugging info showing product ID, file details, endpoints

### 2. **Better Error Handling**
- ✅ Individual tracking for variant image uploads
- ✅ Don't advance to next step if ALL uploads fail
- ✅ Show specific error messages for each upload type

### 3. **API Testing**  
- ✅ Added "Test API" button to verify basic connectivity
- ✅ Added token debugging (check if auth token exists)
- ✅ Added endpoint URL logging

## Potential Causes

### Backend Issues (Most Likely):
1. **Missing Authentication**: Controller requires user authentication
2. **File Processing Error**: Cloudinary integration issue
3. **Database Error**: Product image table constraints
4. **Missing Dependencies**: ImageService or CloudinaryService not working

### Frontend Issues:
1. **Wrong FormData Field**: Should be `"file"` ✅ (correct)
2. **Missing Token**: No authentication header ❓ (checking)
3. **Wrong Content-Type**: Should be `multipart/form-data` ✅ (correct)

## Next Steps

1. **Check Backend Logs**: Look for Java stack traces
2. **Verify Auth Token**: Use Test API button to confirm auth works
3. **Test File Size**: Try smaller images (< 1MB)
4. **Check Cloudinary Config**: Backend may have missing API keys

## Frontend Debug Info Added

```javascript
// Auth token verification
const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
console.log('🔑 Auth token present:', !!token);

// Detailed upload logging
console.log('📸 Uploading main image:', {
  productId: createdProduct.id,
  fileName: mainImageFile.name,
  fileSize: mainImageFile.size,
  fileType: mainImageFile.type,
  endpoint: `http://localhost:8081/api/products/${createdProduct.id}/images/main`
});
```

**Status**: Debugging tools added, need to test with actual upload to see detailed logs.

---
**Next Action**: Test upload again and check browser console for detailed debug info.