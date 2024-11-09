const checkLocalStorage = () => {
    return localStorage != null;
};

const isAuthenticated = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage unavailable!');
    }
    const token = localStorage.getItem('token');
    return token != null && token != '';
};

const logout = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage unavailable!');
    }
    localStorage.removeItem('token');
    window.location.href = '/auth/login.html';
};
