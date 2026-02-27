import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle navigation with a delay.
 * Helpful for allowing success toasts to be visible before redirection.
 */
export const useDelayedNavigate = () => {
    const navigate = useNavigate();

    const delayedNavigate = (to: string | number, delay: number = 1500) => {
        setTimeout(() => {
            if (typeof to === 'number') {
                navigate(to as any);
            } else {
                navigate(to);
            }
        }, delay);
    };

    return delayedNavigate;
};
