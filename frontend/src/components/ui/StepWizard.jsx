export default function StepWizard({ currentStep, totalSteps }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                index + 1 <= currentStep
                  ? 'bg-[#2d3fe0] text-white'
                  : 'bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index + 1 < currentStep ? 'bg-[#2d3fe0]' : 'bg-[#E2E8F0]'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-[#64748B]">
        {Array.from({ length: totalSteps }, (_, index) => (
          <span key={index} className="flex-1 text-center">
            Step {index + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
