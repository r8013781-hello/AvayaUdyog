import React from 'react';

/**
 * Badge component to display a pill-shaped label.
 * Props:
 * - label: string - the text to display inside the badge
 */
const Badge = ({ label }) => {
    return (
        <span className="inline-block bg-brand-maroon text-brand-cream rounded-pill px-4 py-1 text-sm font-semibold font-body select-none transition-transform transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-maroon">
            {label}
        </span>
    );
};

/**
            * Exported badges for use in the UI.
            */
export const ExperienceBadge = () => <Badge label="10+ Years Experience" />;
export const ProjectsBadge = () => <Badge label="100+ Projects" />;

export default Badge;
