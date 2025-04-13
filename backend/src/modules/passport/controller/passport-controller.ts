import * as bcrypt from "bcrypt";

import { NextFunction, Request } from "express";
import { ResponseHandler } from "../../../shared/components/response-handler/response-handler";
import { createPayload, handleUserExistence } from "../../../shared/utils/helper/common-functions";
import { otpServices } from "../../auth/services/otp/otp-services";
import { userService } from "../../auth/services/user/user-service";

export const passportController = {
    async registerUser(req: Request, res: any, next: NextFunction) {
        try {
            const { username, password } = req.body;

            await handleUserExistence({ username, throwUserExistsError: true });

            const otp = await otpServices.generateOtp();

            const allowedFields = createPayload(req.body, ["username", "email", "bio"]);
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser: any = await userService.createUser({
                ...allowedFields,
                password: hashedPassword,
                otp: otp.otp,
                otp_expiry: otp.otpExpiry,
                is_verified: false,
            });

            const payload = createPayload(newUser, [
                "_id", "username", "email", "bio", "avatar_url", "date_registered", "is_verified",
            ]);

            return ResponseHandler.success({
                res,
                statusCode: 201,
                message: "User registered successfully",
                data: {
                    ...payload,
                    ...otp
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async login(req: any, res: any, next: any) {
        const { username, otpRequired } = req.body;

        try {
            const { user }: { user: any } = await handleUserExistence({
                username,
                throwNoUserExistsError: true,
            });

            const isOtpRequired = await otpServices.handleOtp({ user, otpRequired });

            if (isOtpRequired) {
                return ResponseHandler.error({
                    res,
                    statusCode: 200,
                    message: "User not verified Otp has been sent to mail",
                    props: {
                        data: isOtpRequired?.userPayload || null,
                        otp: isOtpRequired?.otp || null,
                    },
                });
            } else {
                req.login(req.user, (err: any) => {
                    if (err) return next(err);
                    return ResponseHandler.success({
                        res,
                        data: req.user,
                        message: "Login successful",
                    });
                });
            }


        } catch (error) {
            return next(error);
        }
    },

    async verifyOtp(req: any, res: any, next: NextFunction) {
        try {
            const { otp, username } = req.body;

            const verifiedUser: any = await otpServices.verifyOtp({ username, inputOtp: otp });

            req.login(verifiedUser, (err: any) => {
                if (err) return next(err);

                const userPayload = createPayload(verifiedUser, [
                    "_id", "username", "email", "bio", "avatar_url", "date_registered", "is_verified",
                ]);

                return ResponseHandler.success({
                    res,
                    statusCode: 200,
                    message: "OTP verified and login successful",
                    data: userPayload,
                });
            });
        } catch (error) {
            next(error);
        }
    },


    async resendOtp(req: any, res: any, next: NextFunction) {
        try {
            const { username } = req.body;

            const { user }: any = await handleUserExistence({ username: username, throwNoUserExistsError: true, throwUserVerifiedError: true });

            const newOtp = await otpServices.generateOtp()

            await userService.updateUser(user._id, { otp: newOtp.otp, otp_expiry: newOtp.otpExpiry });

            ResponseHandler.success({
                res,
                statusCode: 200,
                message: "OTP resend successfully",
                data: newOtp,
            });
        } catch (error) {
            next(error);
        }
    },


    async userDetails(req: any, res: any, next: any) {
        try {
            ResponseHandler.success({ res, data: req.user })
        } catch (error) {
            next(error);
        }
    }


};
