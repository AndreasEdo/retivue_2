import AIBadge from './AIBadge';

export default function ClinicalCard({ children, isAI = false, accentColor = '#001bca' }) {
  return (
    <div
      className="bg-white rounded-xl shadow-[0px_2px_4px_rgba(45, 63, 224, 0.04)] border border-[#E2E8F0] p-6 relative"
      style={{ borderLeft: `4px solid ${isAI ? '#7C3AED' : accentColor}` }}
    >
      {isAI && (
        <div className="absolute top-4 right-4">
          <AIBadge />
        </div>
      )}
      {children}
    </div>
  );
}
