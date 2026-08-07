import React from 'react';

const Lightbox = ({ images, currentIndex, onClose, onPrev, onNext }) => {
    if (!images || images.length === 0) return null;

    const currentImage = images[currentIndex];

    return (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            aria-label="Image viewer"
        >
            <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 text-brand-maroon bg-white rounded-full p-2 shadow-lg hover:bg-brand-maroon hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                style={{ width: '40px', height: '40px' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <button
                onClick={onPrev}
                aria-label="Previous image"
                className="absolute left-4 text-white bg-black bg-opacity-50 rounded-full p-2 shadow-lg hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                style={{ width: '40px', height: '40px' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <img
                src={currentImage.image_url}
                alt={currentImage.title}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
            <button
                onClick={onNext}
                aria-label="Next image"
                className="absolute right-4 text-white bg-black bg-opacity-50 rounded-full p-2 shadow-lg hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                style={{ width: '40px', height: '40px' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
            </button>
        </div>
    );
};

export default Lightbox;
