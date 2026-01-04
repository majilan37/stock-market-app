"use client";

import CountrySelectField from "@/components/CountrySelectField";
import FormFooterLink from "@/components/FormFooterLink";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/input-field";
import SelectField from "@/components/ui/select-field";
import {
  INVESTMENT_GOALS,
  PREFERRED_INDUSTRIES,
  RISK_TOLERANCE_OPTIONS,
} from "@/lib/constants";
import { SubmitHandler, useForm } from "react-hook-form";

function Register() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      investmentGoals: "",
      riskTolerance: "Medium",
      preferredIndustry: "Technology",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    try {
    } catch (error) {}
  };
  return (
    <>
      <h1 className="form-title">Sign up & Personalize</h1>
      <form action="" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="fullName"
          label="Full Name"
          placeholder="Jhon Doe"
          register={register}
          error={errors.fullName}
          validation={{ required: "Full Name is required", minLength: 2 }}
        />

        <InputField
          name="email"
          label="Email"
          placeholder="Enter your email"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            minLength: 2,
            pattern: /^\w+@\w+\.\w+$/,
          }}
        />

        <InputField
          name="password"
          label="Password"
          placeholder="Enter a password"
          register={register}
          error={errors.password}
          type="password"
          validation={{ required: "Password is required", minLength: 8 }}
        />

        {/* Country */}
        <CountrySelectField
          name="country"
          label="Country"
          control={control}
          error={errors.country}
          required
        />

        <SelectField
          name="investmentGoals"
          label="Investment Goal"
          placeholder="Select your investment goal"
          control={control}
          error={errors.investmentGoals}
          options={INVESTMENT_GOALS}
        />

        <SelectField
          name="riskTolerance"
          label="Risk Tolerance"
          placeholder="Select your risk level"
          control={control}
          error={errors.riskTolerance}
          options={RISK_TOLERANCE_OPTIONS}
        />

        <SelectField
          name="preferredIndustry"
          label="Preferred Industry"
          placeholder="Select your preferred industry"
          control={control}
          error={errors.preferredIndustry}
          options={PREFERRED_INDUSTRIES}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting
            ? "Creating an account"
            : "Starting your investing journey"}
        </Button>

        <FormFooterLink
          text="Already have an account ?"
          linkText="Sign in"
          href="/login"
        />
      </form>
    </>
  );
}

export default Register;
