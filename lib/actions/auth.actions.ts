"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { inngest } from "../inngest";

export async function signUpWithEmail(data: SignUpFormData) {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        name: data.fullName,
        email: data.email,
        password: data.password,
      },
    });

    if (response) {
      await inngest.send({
        name: "app/user.created",
        data: {
          email: data.email,
          name: data.fullName,
          country: data.country,
          investmentGoals: data.investmentGoals,
          riskTolerance: data.riskTolerance,
          preferredIndustry: data.preferredIndustry,
        },
      });
    }

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.log("Sign up failed: ", error);
    return {
      success: false,
      error: "Sign up failed",
    };
  }
}

export async function signInWithEmail(data: SignInFormData) {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.log("Sign in failed: ", error);
    return {
      success: false,
      error: "Sign in failed",
    };
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.log("Sign out failed: ", error);
    return {
      success: false,
      error: "Sign out failed",
    };
  }
}
