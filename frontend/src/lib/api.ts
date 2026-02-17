export const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        // Session expired or invalid token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/developer/login';
        throw new Error('Session expired');
    }

    return response;
};
