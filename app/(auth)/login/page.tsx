"use client";

import FormFooterLink from "@/components/FormFooterLink";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/input-field";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

function Login() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    try {
      const result = await signInWithEmail(data);
      if (result.success) {
        router.push("/");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Sign up failed", {
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  };
  return (
    <>
      <h1 className="form-title">Welcome back</h1>
      <form action="" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting ? "Loading..." : "Starting your investing journey"}
        </Button>

        <FormFooterLink
          text="Don't have an account ?"
          linkText="Create an account"
          href="/register"
        />
      </form>
    </>
  );
}

export default Login;
