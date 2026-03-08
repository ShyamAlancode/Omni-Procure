import {
    signUp as amplifySignUp,
    confirmSignUp as amplifyConfirmSignUp,
    signIn as amplifySignIn,
    signOut as amplifySignOut,
    getCurrentUser as amplifyGetCurrentUser,
    fetchAuthSession,
    resendSignUpCode as amplifyResendCode
} from 'aws-amplify/auth';

/**
 * Creates a new user in the Cognito User Pool
 */
export const signUp = async (name: string, email: string, password: string) => {
    try {
        const { isSignUpComplete, userId, nextStep } = await amplifySignUp({
            username: email,
            password,
            options: {
                userAttributes: {
                    name,
                },
                autoSignIn: true
            }
        });

        return { isSignUpComplete, userId, nextStep };
    } catch (error: any) {
        console.error('Sign up error', error);
        throw new Error(error.message || 'Failed to sign up');
    }
};

/**
 * Confirms user registration with OTP sent to email
 */
export const confirmSignUp = async (email: string, code: string) => {
    try {
        const { isSignUpComplete, nextStep } = await amplifyConfirmSignUp({
            username: email,
            confirmationCode: code
        });
        return { isSignUpComplete, nextStep };
    } catch (error: any) {
        console.error('Confirm sign up error', error);
        throw new Error(error.message || 'Invalid verification code');
    }
};

/**
 * Resends the verification OTP code
 */
export const resendSignUpCode = async (email: string) => {
    try {
        const result = await amplifyResendCode({
            username: email
        });
        return result;
    } catch (error: any) {
        console.error('Resend code error', error);
        throw new Error(error.message || 'Failed to resend code');
    }
};

/**
 * Authenticates user and establishes session
 */
export const signIn = async (email: string, password: string) => {
    try {
        const result = await amplifySignIn({
            username: email,
            password
        });

        if (result.isSignedIn) {
            document.cookie = "omniprocure_auth=true; path=/; max-age=86400; SameSite=Strict";
        }

        return result;
    } catch (error: any) {
        console.error('Sign in error', error);
        throw new Error(error.message || 'Invalid email or password');
    }
};

/**
 * Clears local session and signs out of Cognito
 */
export const signOut = async () => {
    try {
        document.cookie = "omniprocure_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        await amplifySignOut();
    } catch (error: any) {
        console.error('Sign out error', error);
    }
};

/**
 * Retrieves the currently authenticated user
 */
export const getCurrentUser = async () => {
    try {
        const user = await amplifyGetCurrentUser();
        return user;
    } catch (error) {
        return null; // Not signed in
    }
};

/**
 * Retrieves the current valid JWT Access Token string
 */
export const getAccessToken = async (): Promise<string | null> => {
    try {
        const session = await fetchAuthSession();
        const tokenStr = session.tokens?.accessToken?.toString();
        return tokenStr ? tokenStr : null;
    } catch (error) {
        return null;
    }
};
