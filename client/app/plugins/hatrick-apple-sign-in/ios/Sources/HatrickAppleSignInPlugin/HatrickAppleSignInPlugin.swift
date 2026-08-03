import AuthenticationServices
import Capacitor
import Foundation

@objc(HatrickAppleSignInPlugin)
public class HatrickAppleSignInPlugin: CAPPlugin, CAPBridgedPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "HatrickAppleSignInPlugin"
    public let jsName = "HatrickAppleSignIn"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise)
    ]

    private var activeCall: CAPPluginCall?

    @objc func signIn(_ call: CAPPluginCall) {
        if activeCall != nil {
            call.reject("Another Apple sign-in request is already running.", "APPLE_SIGN_IN_BUSY")
            return
        }

        activeCall = call

        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]
        if let nonce = call.getString("nonce"), !nonce.isEmpty {
            request.nonce = nonce
        }

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let call = activeCall else { return }
        activeCall = nil

        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            call.reject("Apple did not return an Apple ID credential.", "APPLE_SIGN_IN_INVALID_CREDENTIAL")
            return
        }

        guard
            let identityTokenData = credential.identityToken,
            let identityToken = String(data: identityTokenData, encoding: .utf8)
        else {
            call.reject("Apple did not return an identity token.", "APPLE_SIGN_IN_MISSING_ID_TOKEN")
            return
        }

        let authorizationCode = credential.authorizationCode.flatMap { String(data: $0, encoding: .utf8) }
        let formatter = PersonNameComponentsFormatter()
        let formattedName = credential.fullName.flatMap { formatter.string(from: $0).trimmingCharacters(in: .whitespacesAndNewlines) }
        let fullName = formattedName?.isEmpty == false ? formattedName : nil

        var payload: [String: Any] = [
            "identityToken": identityToken,
            "userIdentifier": credential.user
        ]
        if let authorizationCode {
            payload["authorizationCode"] = authorizationCode
        }
        if let email = credential.email {
            payload["email"] = email
        }
        if let fullName {
            payload["fullName"] = fullName
        }

        call.resolve(payload)
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        guard let call = activeCall else { return }
        activeCall = nil

        let authError = error as? ASAuthorizationError
        if authError?.code == .canceled {
            call.reject("Apple sign-in was cancelled.", "APPLE_SIGN_IN_CANCELLED", error)
            return
        }

        call.reject("Apple sign-in failed.", "APPLE_SIGN_IN_FAILED", error)
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }
}
