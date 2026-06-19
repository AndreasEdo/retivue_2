export default function StepWizard({ currentStep, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        {steps.map((index) => {
          const isLast = index === totalSteps - 1;
          return (
            <div key={index} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  index + 1 <= currentStep
                    ? 'bg-[#2d3fe0] text-white'
                    : 'bg-[#E2E8F0] text-[#64748B]'
                }`}
              >
                {index + 1}
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    index + 1 < currentStep ? 'bg-[#2d3fe0]' : 'bg-[#E2E8F0]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-[#64748B]">
        {steps.map((index) => (
          <span
            key={index}
            className={
              index === 0
                ? 'text-left'
                : index === totalSteps - 1
                ? 'text-right'
                : 'text-center'
            }
          >
            Step {index + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
