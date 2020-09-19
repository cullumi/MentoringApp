import React from 'react';
import { TouchableOpacity, View, ViewPropTypes, Text, Modal, StyleSheet, Image, } from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';
import { pipe, evolve, propSatisfies, applySpec, propOr, add } from 'ramda';
import { v4 } from 'uuid';
import querystring from 'query-string';
const AUTHORIZATION_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const ACCESS_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LOGOUT_URL = 'https://www.linkedin.com/m/logout';
export const cleanUrlString = (state) => state.replace('#!', '');
export const getCodeAndStateFromUrl = pipe(querystring.extract, querystring.parse, evolve({ state: cleanUrlString }));
export const getErrorFromUrl = pipe(querystring.extract, querystring.parse, evolve({ error_description: cleanUrlString }));
export const transformError = applySpec({
    type: propOr('', 'error'),
    message: propOr('', 'error_description'),
});
export const isErrorUrl = pipe(querystring.extract, querystring.parse, propSatisfies((error) => typeof error !== 'undefined', 'error'));
export const injectedJavaScript = `
  setTimeout(function() {
    document.querySelector("input[type=text]").setAttribute("autocapitalize", "off");
  }, 1);
  true;
`;
export const getAuthorizationUrl = ({ authState, clientID, permissions, redirectUri, }) => `${AUTHORIZATION_URL}?${querystring.stringify({
    response_type: 'code',
    client_id: clientID,
    scope: permissions.join(' ').trim(),
    state: authState,
    redirect_uri: redirectUri,
})}`;
export const getPayloadForToken = ({ clientID, clientSecret, code, redirectUri, }) => querystring.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientID,
    client_secret: clientSecret,
});
export const fetchToken = async (payload) => {
    const response = await fetch(ACCESS_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
    });
    return await response.json();
};
export const logError = (error) => console.error(JSON.stringify(error, null, 2));
export const onLoadStart = async (url, authState, onSuccess, onError, close, getAccessToken, shouldGetAccessToken) => {
    if (isErrorUrl(url)) {
        const err = getErrorFromUrl(url);
        close();
        onError(transformError(err));
    }
    else {
        const { code, state } = getCodeAndStateFromUrl(url);
        if (!shouldGetAccessToken) {
            onSuccess({ authentication_code: code });
        }
        else if (state !== authState) {
            onError({
                type: 'state_not_match',
                message: `state is not the same ${state}`,
            });
        }
        else {
            const token = await getAccessToken(code);
            onSuccess(token);
        }
    }
};
const closeSize = { width: 24, height: 24 };
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 40,
        paddingHorizontal: 10,
    },
    wrapper: {
        flex: 1,
        borderRadius: 5,
        borderWidth: 10,
        borderColor: 'rgba(0, 0, 0, 0.6)',
    },
    close: {
        position: 'absolute',
        top: 35,
        right: 5,
        backgroundColor: '#000',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        ...closeSize,
    },
});
export default class LinkedInModal extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            raceCondition: false,
            modalVisible: false,
            authState: v4(),
            logout: false,
        };
        this.onNavigationStateChange = async ({ url }) => {
            const { raceCondition } = this.state;
            const { redirectUri, onError, shouldGetAccessToken } = this.props;
            if (url.includes(redirectUri) && !raceCondition) {
                const { onSignIn, onSuccess } = this.props;
                const { authState } = this.state;
                this.setState({ modalVisible: false, raceCondition: true });
                if (onSignIn) {
                    onSignIn();
                }
                await onLoadStart(url, authState, onSuccess, onError, this.close, this.getAccessToken, shouldGetAccessToken);
            }
        };
        this.getAuthorizationUrl = () => getAuthorizationUrl({ ...this.props, authState: this.state.authState });
        this.getAccessToken = async (code) => {
            const { onError } = this.props;
            const payload = getPayloadForToken({ ...this.props, code });
            const token = await fetchToken(payload);
            if (token.error) {
                onError(transformError(token));
                return {};
            }
            return token;
        };
        this.close = () => {
            const { onClose } = this.props;
            if (onClose) {
                onClose();
            }
            this.setState({ modalVisible: false });
        };
        this.open = () => {
            const { onOpen } = this.props;
            if (onOpen) {
                onOpen();
            }
            this.setState({ modalVisible: true });
        };
        this.logoutAsync = () => new Promise(resolve => {
            this.setState({ logout: true });
            setTimeout(() => {
                this.setState({ logout: false });
                resolve();
            }, 3000);
        });
        this.renderButton = () => {
            const { renderButton, linkText } = this.props;
            if (renderButton) {
                return renderButton();
            }
            return (React.createElement(TouchableOpacity, { accessibilityComponentType: 'button', accessibilityTraits: ['button'], onPress: this.open },
                React.createElement(Text, null, linkText)));
        };
        this.renderClose = () => {
            const { renderClose } = this.props;
            if (renderClose) {
                return renderClose();
            }
            return (React.createElement(Image, { source: require('./assets/x-white.png'), resizeMode: "contain", style: {
                    ...evolve({ width: add(-8), height: add(-8) }, closeSize),
                } }));
        };
        this.renderWebview = () => {
            const { modalVisible } = this.state;
            if (!modalVisible) {
                return null;
            }
            return (React.createElement(WebView, { source: { uri: this.getAuthorizationUrl() }, onNavigationStateChange: this.onNavigationStateChange, startInLoadingState: true, javaScriptEnabled: true, domStorageEnabled: true, injectedJavaScript: injectedJavaScript, sharedCookiesEnabled: true }));
        };
    }
    componentDidUpdate(nextProps, nextState) {
        if (nextState.modalVisible !== this.state.modalVisible &&
            nextState.modalVisible === true) {
            const authState = nextProps.authState || v4();
            this.setState(() => ({ raceCondition: false, authState }));
        }
    }
    render() {
        const { modalVisible, logout } = this.state;
        const { animationType, containerStyle, wrapperStyle, closeStyle, } = this.props;
        return (React.createElement(View, null,
            this.renderButton(),
            React.createElement(Modal, { animationType: animationType, transparent: true, visible: modalVisible, onRequestClose: this.close },
                React.createElement(View, { style: [styles.container, containerStyle] },
                    React.createElement(View, { style: [styles.wrapper, wrapperStyle] }, this.renderWebview()),
                    React.createElement(TouchableOpacity, { onPress: this.close, style: [styles.close, closeStyle], accessibilityComponentType: 'button', accessibilityTraits: ['button'] }, this.renderClose()))),
            logout && (React.createElement(View, { style: { width: 1, height: 1 } },
                React.createElement(WebView, { source: { uri: LOGOUT_URL }, javaScriptEnabled: true, domStorageEnabled: true, sharedCookiesEnabled: true, onLoadEnd: () => this.setState({ logout: false }) })))));
    }
}
LinkedInModal.propTypes = {
    clientID: PropTypes.string.isRequired,
    clientSecret: PropTypes.string,
    redirectUri: PropTypes.string.isRequired,
    permissions: PropTypes.array,
    authState: PropTypes.string,
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onSignIn: PropTypes.func,
    linkText: PropTypes.string,
    renderButton: PropTypes.func,
    renderClose: PropTypes.func,
    containerStyle: ViewPropTypes.style,
    wrapperStyle: ViewPropTypes.style,
    closeStyle: ViewPropTypes.style,
    animationType: PropTypes.string,
    shouldGetAccessToken: PropTypes.bool,
};
LinkedInModal.defaultProps = {
    onError: logError,
    permissions: ['r_liteprofile', 'r_emailaddress'],
    linkText: 'Login with LinkedIn',
    animationType: 'fade',
    containerStyle: StyleSheet.create({}),
    wrapperStyle: StyleSheet.create({}),
    closeStyle: StyleSheet.create({}),
    shouldGetAccessToken: true,
};
//# sourceMappingURL=index.js.map