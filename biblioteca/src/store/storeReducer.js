export const initialState = {
    theme: localStorage.getItem('biblioteca_theme') || 'light',
    auth: {
        user: JSON.parse(localStorage.getItem('biblioteca_user')) || null,
        accessToken: localStorage.getItem('biblioteca_access_token') || null,
        refreshToken: localStorage.getItem('biblioteca_refresh_token') || null,
        isAuthenticated: Boolean(localStorage.getItem('biblioteca_access_token')),
    },
    libros: [],
    prestamos: [],
    loading: false,
    notification: null, // { variant: 'success' | 'danger' | 'warning', message: string }
};

export function storeReducer(state, action) {
    switch (action.type) {
        case 'TOGGLE_THEME': {
            const nextTheme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('biblioteca_theme', nextTheme);
            return { ...state, theme: nextTheme };
        }
        case 'LOGIN_SUCCESS': {
            const { accessToken, refreshToken, email, rol } = action.payload;
            const user = { email, rol };
            localStorage.setItem('biblioteca_access_token', accessToken);
            localStorage.setItem('biblioteca_refresh_token', refreshToken);
            localStorage.setItem('biblioteca_user', JSON.stringify(user));
            return {
                ...state,
                auth: { user, accessToken, refreshToken, isAuthenticated: true },
            };
        }
        case 'TOKEN_REFRESHED': {
            const { accessToken, refreshToken } = action.payload;
            localStorage.setItem('biblioteca_access_token', accessToken);
            if (refreshToken) {
                localStorage.setItem('biblioteca_refresh_token', refreshToken);
            }
            return {
                ...state,
                auth: {
                    ...state.auth,
                    accessToken,
                    refreshToken: refreshToken || state.auth.refreshToken,
                },
            };
        }
        case 'LOGOUT': {
            localStorage.removeItem('biblioteca_access_token');
            localStorage.removeItem('biblioteca_refresh_token');
            localStorage.removeItem('biblioteca_user');
            return {
                ...state,
                auth: { user: null, accessToken: null, refreshToken: null, isAuthenticated: false },
                libros: [],
                prestamos: [],
            };
        }
        case 'SET_LIBROS':
            return { ...state, libros: action.payload };
        case 'SET_PRESTAMOS':
            return { ...state, prestamos: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SHOW_NOTIFICATION':
            return { ...state, notification: action.payload };
        case 'CLEAR_NOTIFICATION':
            return { ...state, notification: null };
        default:
            return state;
    }
}