# Product Image Upload Implementation Guide

## Overview

This implementation adds local multi-image upload functionality to your product creation and update endpoints. Images are stored locally in the `uploads/products` directory and the file paths are saved to the database. The system includes automatic file deletion on update and rollback on failure.

## Features

- ✅ Upload **multiple images** (up to 5) when creating a product
- ✅ Upload/update **multiple images** (up to 5) when updating a product
- ✅ **Automatic deletion** of old images when new ones are uploaded
- ✅ **File rollback** if product creation/update fails
- ✅ Image validation (only jpeg, png, gif, webp)
- ✅ File size limit (5MB max per file)
- ✅ Automatic filename generation with timestamp
- ✅ Static file serving for uploaded images
- ✅ Automatic cleanup of all images when products are deleted
- ✅ ProductImage table for storing image history

## Directory Structure

```
uploads/
└── products/          # All product images stored here
index.ts              # Updated with static file serving
src/
├── controllers/
│   └── product.controller.ts    # Updated to handle multiple files & rollback
├── routes/
│   └── product.routes.ts        # Updated with uploadMultiple middleware
├── repositories/
│   └── product.repository.ts    # Updated to manage multiple images
├── services/
│   └── product.service.ts       # Updated comments
├── types/
│   └── index.ts                 # Updated DTOs with imageUrls array
└── utils/
    └── multer.ts                # Updated with multi-file support & rollback
```

## API Usage

### Create Product with Multiple Images

```bash
POST /isdn/api/products

# Multipart form data:
- productCode: "PROD001"
- name: "Product Name"
- categoryId: 1
- unitPrice: 100.00
- unitType: "kg"
- description: "Optional description"
- image: <binary file 1>    # Optional - up to 5 image files
- image: <binary file 2>
- image: <binary file 3>
```

**cURL Example:**

```bash
curl -X POST http://localhost:3100/isdn/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "productCode=PROD001" \
  -F "name=Product Name" \
  -F "categoryId=1" \
  -F "unitPrice=100.00" \
  -F "unitType=kg" \
  -F "image=@image1.jpg" \
  -F "image=@image2.jpg" \
  -F "image=@image3.jpg"
```

### Update Product with Multiple Images

```bash
PUT /isdn/api/products/:id

# Multipart form data:
- name: "Updated Name"
- unitPrice: 120.00
- image: <binary file 1>    # Optional - new images replace ALL old images
- image: <binary file 2>
```

**Important:** When you provide new images during update:

- ✅ All OLD images are automatically DELETED from the file system
- ✅ All OLD image records are DELETED from the database
- ✅ NEW images are uploaded and saved

**cURL Example:**

```bash
curl -X PUT http://localhost:3100/isdn/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Updated Name" \
  -F "image=@new_image1.jpg" \
  -F "image=@new_image2.jpg"
```

### Get Product

```bash
GET /isdn/api/products/:id

# Response includes:
{
  "success": true,
  "data": {
    "id": 1,
    "productCode": "PROD001",
    "name": "Product Name",
    "imageUrl": "/uploads/products/filename.jpg",    # Main image
    "productImages": [
      {
        "id": 1,
        "productId": 1,
        "imageUrl": "/uploads/products/filename1.jpg",
        "createdAt": "2026-02-07T..."
      },
      {
        "id": 2,
        "productId": 1,
        "imageUrl": "/uploads/products/filename2.jpg",
        "createdAt": "2026-02-07T..."
      }
    ]
  },
  "message": "Product retrieved successfully"
}
```

## Image Access

Uploaded images can be accessed via HTTP:

```
http://localhost:3100/uploads/products/product-1707312847000-123456789.jpg
```

## Configuration

The multer configuration is in `src/utils/multer.ts`:

- Upload directory: `/uploads/products`
- Max file size: 5MB per file
- Max files per request: 5 images
- Allowed formats: JPEG, PNG, GIF, WebP
- Unique filenames: Uses timestamp + random hash to prevent collisions

## File Management & Error Handling

### Upload Success Flow

1. **Files are uploaded** to `uploads/products/`
2. **File paths are stored** in `productImages` table
3. **Main image path** is stored in `product.imageUrl`
4. **Response** is sent to client

### Update with New Files Flow

1. **New files are uploaded** to `uploads/products/`
2. **OLD files are deleted** from `uploads/products/` filesystem
3. **OLD image records** are deleted from database
4. **NEW image records** are created in database
5. **Response** is sent to client

**Important:** Only the most recent images are kept. Previous images are completely removed.

### Error/Failure Rollback

If the product creation or update **fails** at any point:

1. **All uploaded files are automatically deleted** from the filesystem
2. **No database records are created/modified**
3. **Error response** is sent to client
4. **File system remains clean**

This ensures that failed operations don't leave orphaned files.

### Deletion Flow

When a product is deleted:

1. **Main image** (`product.imageUrl`) is deleted from filesystem
2. **All product images** from `productImages` table are deleted from filesystem
3. **All database records** are deleted

## Error Messages

| Error                                                 | Cause                                     | Solution                            |
| ----------------------------------------------------- | ----------------------------------------- | ----------------------------------- |
| "Only image files are allowed (jpeg, png, gif, webp)" | Uploaded file is not a valid image format | Use JPEG, PNG, GIF, or WebP formats |
| "File too large"                                      | File exceeds 5MB limit                    | Compress image or use smaller files |
| "Unexpected field"                                    | Field name doesn't match "images"         | Use form field name "images"        |
| "Product not found"                                   | Product doesn't exist                     | Verify product ID before updating   |
| "Product category not found"                          | Category doesn't exist                    | Verify category ID before updating  |

## Testing with Postman

1. Set request method to **POST** or **PUT**
2. Go to **Body** tab
3. Select **form-data**
4. Add fields:
   - productCode (text)
   - name (text)
   - categoryId (text)
   - unitPrice (text)
   - unitType (text)
   - **images** (file) - select this for each image file
5. Select multiple image files for the "images" field
6. Add Authorization header with Bearer token
7. Send request

## Best Practices

✅ **DO:**

- Upload images in JPEG or PNG format for best compatibility
- Keep individual image files under 2MB for better performance
- Use descriptive product names to identify images
- Test with 2-3 images before uploading many

❌ **DON'T:**

- Upload files larger than 5MB
- Upload non-image files (will be rejected)
- Delete files from `uploads/products/` directory manually (delete via API instead)
- Upload images with special characters in filenames (system handles this automatically)

## Database Schema

Product table includes:

- `imageUrl` (String?, nullable): Main product image path
- `productImages` (relation): Historical images for the product

ProductImage table stores:

- `id`: Unique identifier
- `productId`: Reference to product
- `imageUrl`: Image file path
- `createdAt`: Upload timestamp

## Error Handling

- Invalid file format: `"Only image files are allowed (jpeg, png, gif, webp)"`
- File too large: Returns 400 error if file exceeds 5MB
- Missing required fields: Returns 400 with missing fields list

## Important Notes

1. Add `uploads/` to your `.gitignore` to avoid committing uploaded images
2. Images are stored locally - for production, consider cloud storage (AWS S3, Azure Blob)
3. When deleting a product, associated image files are automatically deleted
4. Image files persist on server - implement cleanup strategy for old images
5. Behind reverse proxy? Configure CORS and ensure `/uploads` path is accessible

## Testing with cURL

```bash
# Create product with image
curl -X POST http://localhost:3000/isdn/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "productCode=TEST001" \
  -F "name=Test Product" \
  -F "categoryId=1" \
  -F "unitPrice=50" \
  -F "unitType=pcs" \
  -F "image=@/path/to/image.jpg"

# Update product image
curl -X PUT http://localhost:3000/isdn/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/new-image.jpg"
```

## Troubleshooting

- Ensure `uploads` directory has write permissions
- Check file paths are accessible from the web root
- Verify MIME types are correctly set
- Check server logs for detailed error messages
