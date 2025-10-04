import { useState } from 'react';
import Toast from '@/utils/toast';

export const useLeaveBrain = ({ onLeaveSuccess }: { onLeaveSuccess?: (brainId: string) => void } = {}) => {
    const [isLeaving, setIsLeaving] = useState(false);
    const [leftBrains, setLeftBrains] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            return JSON.parse(sessionStorage.getItem('leftBrains') || '[]');
        }
        return [];
    });

    const leaveBrain = async (brainId: string) => {
        setIsLeaving(true);
        try {
            const response = await fetch('/api/brain/leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ brainId }),
            });

            const result = await response.json();

            if (response.ok) {
                Toast(result?.data?.message || 'Successfully left the brain');
                
                const updatedLeftBrains = [...leftBrains, brainId];
                setLeftBrains(updatedLeftBrains);

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('leftBrains', JSON.stringify(updatedLeftBrains));
                }
                
                onLeaveSuccess?.(brainId);
            } else {
                throw new Error(result?.message || `Failed to leave brain`);
            }
        } catch (error: any) {
            console.error('Error leaving brain:', error);
            Toast(error?.message || 'Error leaving brain');
        } finally {
            setIsLeaving(false);
        }
    };

    const isBrainLeft = (brainId: string) => leftBrains.includes(brainId);

    const resetLeftBrain = (brainId: string) => {
        const updatedLeftBrains = leftBrains.filter(id => id !== brainId);
        setLeftBrains(updatedLeftBrains);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('leftBrains', JSON.stringify(updatedLeftBrains));
        }
    };

    return { leaveBrain, isLeaving, isBrainLeft, resetLeftBrain, leftBrains };
};

export default useLeaveBrain;