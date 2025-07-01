import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  Button,
  Input,
  Image,
  InputOtp,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import {
  verify_otp,
  verify_user,
  verify_user_firebase,
  resend_otp,
} from "@/interceptor/routes";
import { login, register, sign_up, updateUserSettings } from "@/events/actions";
import { setAuth } from "@/store/reducers/authenticationSlice";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { getFirebaseConfig } from "@/helpers/functionHelper";
import firebaseService from "@/@core/firebase";

const LoginModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const firebase = getFirebaseConfig();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE;
  const countryCode = process.env.NEXT_PUBLIC_COUNTRY_CODE;

  // Added Authentication mode selector
  const Authentication_mode = useSelector(
    (state) => state?.settings?.value?.authentication_mode
  );

  const isGoogleAvailable = useSelector(
    (state) =>
      state?.settings?.value?.system_settings?.[0]?.google_login === "1"
  );

  const getInitialState = useCallback(
    () => ({
      phoneNumber: demoMode === "true" ? "919999999999" : "",
      isLoading: false,
      isOTPLoading: false,
      OTPReset: false,
      otp: demoMode === "true" ? "123456" : "",
      resendDisabled: false,
      resendTime: 0,
      showRegistrationForm: false,
      sendOtp: false,
      verifyOtp: false,
      showOtpInput: false,
      otpSessionId: null,
    }),
    [demoMode]
  );

  const [state, setState] = useState(getInitialState());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    country_code: countryCode,
    referral: "",
  });

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setState(getInitialState());
      setFormData({
        name: "",
        email: "",
        mobile: "",
        country_code: countryCode,
        referral: "",
      });
    }
  }, [isOpen, getInitialState, countryCode]);

  // Initialize recaptcha on mount
  useEffect(() => {
    if (isOpen && !Authentication_mode) {
      const auth = getAuth();
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  }, [isOpen, Authentication_mode]);

  // Resend timer effect
  useEffect(() => {
    let interval;
    if (state.resendDisabled && state.resendTime > 0) {
      interval = setInterval(() => {
        setState((prevState) => {
          const newTime = prevState.resendTime - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            return {
              ...prevState,
              resendDisabled: false,
              resendTime: 0,
            };
          }
          return {
            ...prevState,
            resendTime: newTime,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.resendDisabled, state.resendTime]);

  // Handle input changes for registration form
  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // Firebase OTP handlers
  const handleSendOTPFirebase = useCallback(async () => {
    if (!state.phoneNumber) {
      toast.error(t("please-enter-your-number"));
      return;
    }

    setState((prevState) => ({
      ...prevState,
      sendOtp: true,
    }));

    try {
      const auth = await firebaseService.getAuth();
      const confirmationResult = await auth.signInWithPhoneNumber(
        `+${state.phoneNumber}`,
        window.recaptchaVerifier
      );

      if (confirmationResult) {
        toast.success("Otp sent successfully");
        window.confirmationResult = confirmationResult;
        setState((prevState) => ({
          ...prevState,
          sendOtp: false,
          showOtpInput: true,
        }));
      }
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        sendOtp: false,
      }));
      toast.error(error.message);
    }
  }, [state.phoneNumber, t]);

  // Regular OTP handler
  const handleSendOTP = useCallback(async () => {
    if (!state.phoneNumber) {
      toast.error(t("please-enter-your-number"));
      return;
    }

    setState((prevState) => ({
      ...prevState,
      sendOtp: true,
    }));

    try {
      const response = await verify_user({ mobile: state.phoneNumber });

      if (!response.error) {
        toast.success("Otp sent successfully");
        setState((prevState) => ({
          ...prevState,
          otpSessionId: response.otpSessionId,
          sendOtp: false,
          showOtpInput: true,
        }));
      } else {
        toast.error(response.error);
        setState((prevState) => ({
          ...prevState,
          sendOtp: false,
        }));
      }
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        sendOtp: false,
      }));
      toast.error(error.message);
    }
  }, [state.phoneNumber, t]);

  // Resend OTP handlers
  const handleResendOTP = useCallback(async () => {
    try {
      setState((prevState) => ({
        ...prevState,
        resendDisabled: true,
        resendTime: 30,
      }));

      const response = await resend_otp({ mobile: state.phoneNumber });

      if (response.error) {
        toast.error(response.error);
        setState((prevState) => ({
          ...prevState,
          resendDisabled: false,
          resendTime: 0,
        }));
      }
    } catch (error) {
      toast.error(error.message);
      setState((prevState) => ({
        ...prevState,
        resendDisabled: false,
        resendTime: 0,
      }));
    }
  }, [state.phoneNumber]);

  const handleResendOTPFirebase = useCallback(async () => {
    try {
      setState((prevState) => ({
        ...prevState,
        resendDisabled: true,
        resendTime: 30,
      }));

      window.confirmationResult = null;
      const auth = await firebaseService.getAuth();
      const confirmationResult = await auth.signInWithPhoneNumber(
        `+${state.phoneNumber}`,
        window.recaptchaVerifier
      );

      window.confirmationResult = confirmationResult;
    } catch (error) {
      toast.error(error.message);
      setState((prevState) => ({
        ...prevState,
        resendDisabled: false,
        resendTime: 0,
      }));
    }
  }, [state.phoneNumber]);

  // OTP verification handlers
  const handleOTPVerificationFirebase = useCallback(async () => {
    if (!state.otp) {
      toast.error(t("please-enter-verification-code"));
      return;
    }

    setState((prevState) => ({ ...prevState, verifyOtp: true }));

    try {
      await window.confirmationResult.confirm(state.otp);
      const verify = await verify_user_firebase({
        mobile: state.phoneNumber.slice(2),
      });

      if (verify?.error) {
        setState((prevState) => ({
          ...prevState,
          showRegistrationForm: true,
          verifyOtp: false,
        }));
      } else {
        const loginResponse = await login({
          phoneNumber: state.phoneNumber.slice(2),
        });

        if (loginResponse?.error || loginResponse?.data?.error) {
          setState((prevState) => ({
            ...prevState,
            showRegistrationForm: true,
            verifyOtp: false,
          }));
          toast.error(loginResponse?.data?.message);
        } else {
          toast.success("login successful");
          onClose();
        }
      }
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        verifyOtp: false,
      }));
      toast.error("failed to verify otp");
    }
  }, [state.otp, state.phoneNumber, onClose, t]);

  const handleOTPVerification = useCallback(async () => {
    if (!state.otp) {
      toast.error(t("please-enter-verification-code"));
      return;
    }

    setState((prevState) => ({ ...prevState, verifyOtp: true }));

    try {
      const otpResponse = await verify_otp({
        mobile: state.phoneNumber,
        otp: state.otp,
      });

      if (!otpResponse.error) {
        const loginResponse = await login({
          phoneNumber: state.phoneNumber.slice(2),
        });

        if (loginResponse?.error || loginResponse?.data?.error) {
          setState((prevState) => ({
            ...prevState,
            showRegistrationForm: true,
            verifyOtp: false,
          }));
          toast.error(loginResponse?.data?.message);
        } else {
          toast.success("login successful");
          onClose();
        }
      } else {
        setState((prevState) => ({
          ...prevState,
          verifyOtp: false,
        }));
        toast.error(otpResponse.message);
      }
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        verifyOtp: false,
      }));
      toast.error("failed to verify otp");
    }
  }, [state.otp, state.phoneNumber, onClose, t]);

  // Handle registration
  const handleRegister = async () => {
    try {
      const registrationData = {
        ...formData,
        mobile: state.phoneNumber.slice(2),
        country_code: state.phoneNumber.slice(0, 2),
      };

      const registrationResponse = await register(registrationData);

      if (registrationResponse?.error || registrationResponse?.data?.error) {
        toast.error(
          registrationResponse?.message ||
            registrationResponse?.data?.message ||
            "registration failed"
        );
      } else {
        toast.success("registration successful");

        const loginResponse = await login({
          phoneNumber: state.phoneNumber.slice(2),
        });

        if (loginResponse?.error || loginResponse?.data?.error) {
          toast.error(loginResponse?.data?.message || "login failed");
        } else {
          toast.success("login successful");
          onClose();
        }
      }
    } catch (error) {
      toast.error("registration error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const auth = await firebaseService.getAuth();
      const googleProvider = await firebaseService.getGoogleAuthProvider();

      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await auth.signInWithPopup(googleProvider);
      const { displayName, email } = result.user;

      // Call your backend API
      const signUpResponse = await sign_up({
        name: displayName,
        email: email,
        type: "google",
      });

      if (signUpResponse?.token) {
        dispatch(
          setAuth({
            token: signUpResponse.token,
            error: signUpResponse.error,
            data: signUpResponse.data,
          })
        );

        if (signUpResponse.settings) {
          dispatch(updateUserSettings(signUpResponse.settings));
        }

        toast.success("Google login successful");
        onClose();
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      if (err.code === "auth/popup-blocked") {
        toast.error("Please allow popups for this website");
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.error("Login cancelled");
      } else {
        toast.error(err.message || "Login failed");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      size="sm"
      placement="bottom-center"
      className="rounded"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <div className="p-4 flex items-center justify-center">
            <div id="recaptcha-container" className="hidden"></div>
            <div className="flex rounded-2xl">
              <div className="p-6 flex flex-col justify-center space-y-6">
                <div className="mb-8">
                  <h3 className="text-3xl font-extrabold text-primary-600">
                    {state.showRegistrationForm ? "register now" : "login"}
                  </h3>
                </div>

                <div className="space-y-6">
                  {state.showRegistrationForm ? (
                    // Registration Form
                    <>
                      <Input
                        type="text"
                        placeholder={"Name"}
                        value={formData.name}
                        onChange={handleInputChange("name")}
                        className="w-full px-4 py-3"
                        required
                      />
                      <Input
                        type="email"
                        placeholder={"Email address"}
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        className="w-full px-4 py-3"
                        required
                      />
                      <Input
                        type="text"
                        placeholder={"Referral code(optional)"}
                        value={formData.referral}
                        onChange={handleInputChange("referral")}
                        className="w-full px-4 py-3"
                      />
                      <Button
                        onPress={handleRegister}
                        className="w-full bg-primary-600 text-white py-3"
                      >
                        {t("create-account")}
                      </Button>
                      <div className="text-center">
                        <span
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              showRegistrationForm: false,
                            }))
                          }
                          className="text-primary-600 hover:underline cursor-pointer"
                        >
                          {t("already-have-account")}
                        </span>
                      </div>
                    </>
                  ) : (
                    // Login Form
                    <>
                      <div className="relative">
                        <PhoneInput
                          country={countryCode.toLowerCase()}
                          value={state.phoneNumber}
                          enableSearch={true}
                          onChange={(phone) =>
                            setState((prev) => ({
                              ...prev,
                              phoneNumber: phone,
                            }))
                          }
                          inputProps={{
                            className:
                              "w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:outline-none transition duration-300",
                            disabled: state.showOtpInput,
                          }}
                          containerClass="w-full"
                          disableDropdown={state.showOtpInput}
                        />
                      </div>

                      {state.showOtpInput && (
                        <div className="space-y-4">
                          <InputOtp
                            length={6}
                            value={state.otp}
                            onValueChange={(value) =>
                              setState((prev) => ({ ...prev, otp: value }))
                            }
                            className="flex justify-center"
                            inputClassName="w-14 h-14 mx-1 text-center border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-300"
                          />

                          <div className="flex justify-between items-center">
                            <Button
                              size="md"
                              variant="light"
                              onPress={
                                Authentication_mode
                                  ? handleResendOTP
                                  : handleResendOTPFirebase
                              }
                              isDisabled={state.resendDisabled}
                              className="rounded"
                            >
                              {state.resendDisabled
                                ? `${t("resend-in")} ${state.resendTime}s`
                                : "Resend Otp"}
                            </Button>

                            <Button
                              size="md"
                              color="primary"
                              onPress={
                                Authentication_mode
                                  ? handleOTPVerification
                                  : handleOTPVerificationFirebase
                              }
                              isLoading={state.verifyOtp}
                              className="rounded"
                            >
                              Verify Otp
                            </Button>
                          </div>
                        </div>
                      )}

                      {!state.showOtpInput && (
                        <Button
                          onPress={
                            Authentication_mode
                              ? handleSendOTP
                              : handleSendOTPFirebase
                          }
                          isLoading={state.sendOtp}
                          className="w-full bg-primary-600 text-white py-3"
                        >
                          Continue
                        </Button>
                      )}

                      {isGoogleAvailable && !state.showOtpInput && (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">
                                {t("or")}
                              </span>
                            </div>
                          </div>

                          <Button
                            onPress={handleGoogleLogin}
                            variant="bordered"
                            className="w-full"
                            startContent={
                              <Image
                                src="/assets/images/google-logo.svg"
                                alt="Google"
                                className="w-5 h-5"
                              />
                            }
                          >
                            {t("continue_with_google")}
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
