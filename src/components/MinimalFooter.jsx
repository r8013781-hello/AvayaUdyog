import React from 'react';

const MinimalFooter = () => {
    return (
        <footer className="bg-brand-cream text-brand-maroonDark py-6 text-center font-body">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="text-2xl font-bold font-heading mb-2 md:mb-0">
                    Avaya Udyog
                </div>
                <div className="text-sm">
                    &copy; 2024 Avaya Udyog. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default MinimalFooter;
