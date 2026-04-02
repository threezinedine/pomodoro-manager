import { useCallback, useEffect, useRef } from 'react';

interface NotificationOptions {
    body?: string;
    icon?: string;
    tag?: string;
}

export const useNotification = () => {
    const permissionRef = useRef<NotificationPermission | null>(null);

    useEffect(() => {
        permissionRef.current = Notification.permission;
    }, []);

    const notify = useCallback(
        (title: string, options: NotificationOptions = {}) => {
            if (!('Notification' in window)) return;
            if (permissionRef.current !== 'granted') return;

            new Notification(title, {
                icon: '/favicon.ico',
                ...options,
            });
        },
        [],
    );

    const request = useCallback(async () => {
        if (!('Notification' in window)) return false;
        const result = await Notification.requestPermission();
        permissionRef.current = result;
        return result === 'granted';
    }, []);

    return { notify, request, permission: permissionRef.current };
};
