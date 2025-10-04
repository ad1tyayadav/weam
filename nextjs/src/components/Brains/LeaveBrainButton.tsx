import React, { useState } from "react";
import useLeaveBrain from "@/hooks/brains/useLeaveBrain";
import ExitIcon from "@/icons/ExitIcon";

interface LeaveBrainButtonProps {
  brainId: string;
  brainTitle: string;
  onLeaveSuccess?: (brainId: string) => void;
  buttonClassName?: string;
  iconClassName?: string;
  hideLabel?: boolean;
}

const LeaveBrainButton: React.FC<LeaveBrainButtonProps> = ({
  brainId,
  brainTitle,
  onLeaveSuccess,
  buttonClassName = "",
  iconClassName = "",
  hideLabel = false,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { leaveBrain, isLeaving } = useLeaveBrain({ onLeaveSuccess });

  const handleLeave = () => {
    leaveBrain(brainId);
    setShowConfirmation(false);
  };

  return (
    <>
      <div
        onClick={() => setShowConfirmation(true)}
        className={`cursor-pointer flex items-center gap-x-1 text-red-600 hover:opacity-80 transition-opacity ${buttonClassName}`}
      >
        <ExitIcon
          width={14}
          height={14}
          className={`fill-red-600 ${iconClassName}`}
        />
        {!hideLabel && <span className="hidden md:inline">Leave Brain</span>}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-xl p-6 w-80 mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-3 text-gray-900">Leave Brain</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Are you sure you want to leave{" "}
              <strong className="text-gray-900">"{brainTitle}"</strong>? <br />
              You will lose access to all its content.
            </p>

            <div className="flex justify-end gap-3 mt-4 flex-wrap">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={isLeaving}
              >
                Cancel
              </button>

              <button
                onClick={handleLeave}
                className="px-5 py-2.5 border border-red-300 rounded-lg text-red-400 hover:bg-red-50 font-mediu disabled:opacity-50 flex items-center gap-2"
                disabled={isLeaving}
              >
                {isLeaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-300 text-red-400 rounded-full animate-spin" />
                    <span>Leaving...</span>
                  </>
                ) : (
                  <span>Leave Brain</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveBrainButton;