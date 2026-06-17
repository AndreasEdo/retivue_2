import AIBadge from './AIBadge';

export default function ClinicalCard({ children, isAI = false }) {
  return (
    <div
      className="bg-white rounded-lg border border-[#F1F5F9] p-6 relative"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        borderLeft: isAI ? '3px solid #7C3AED' : undefined,
      }}
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
