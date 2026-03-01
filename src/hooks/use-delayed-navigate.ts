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
                navigate(to as unknown as string); // casting to string strictly per TS requirement for useNavigate if overloaded
            } else {
                navigate(to);
            }
        }, delay);
    };

    return delayedNavigate;
};
