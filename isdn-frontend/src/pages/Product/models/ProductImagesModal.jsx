import { Modal } from "../../../components/feedback/Modal";
import { Button } from "../../../components/ui/Button";

export function ProductImagesModal({ isOpen, onClose, product }) {
  if (!product) return null;

  const images = product.productImages || [];
  const hasImages = images.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Product Images - ${product.name}`}
      maxWidth="max-w-6xl"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <div className="space-y-4">
        {!hasImages && (
          <div className="text-center py-8 text-slate-500">
            <p>No images available for this product.</p>
          </div>
        )}

        {hasImages && (
          <div className="max-h-[600px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                >
                  <div className="aspect-square relative">
                    <img
                      src={`http://localhost:3100${image.imageUrl}`}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300?text=Image+Not+Found";
                      }}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
