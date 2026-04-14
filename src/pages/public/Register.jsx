import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { UtensilsCrossed } from "lucide-react";
import FormField from "../../components/ui/FormField";

const schema = yup.object({
  full_name: yup
    .string()
    .required("Full name is required")
    .max(200, "Max 200 characters"),
  phone: yup
    .string()
    .required("Phone number is required")
    .max(20, "Max 20 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "At least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  role: yup.string().oneOf(["customer", "owner"]).required("Select a role"),
});

const inputCls =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent";

export default function Register() {
  const { register: authRegister, login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: "customer" },
  });

  const onSubmit = async ({ full_name, phone, email, password, role }) => {
    try {
      await authRegister({ full_name, phone, email, password, role });
      const decoded = await login(email, password);
      toast.success("Account created! Welcome to JustEats!");
      navigate(decoded.role === "owner" ? "/owner/dashboard" : "/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-100 p-3 rounded-xl mb-3">
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mt-1">Join JustEats today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Full Name" error={errors.full_name?.message}>
            <input
              {...register("full_name")}
              type="text"
              placeholder="Jane Doe"
              className={inputCls}
            />
          </FormField>

          <FormField label="Phone Number" error={errors.phone?.message}>
            <input
              {...register("phone")}
              type="tel"
              placeholder="+44 7700 000000"
              className={inputCls}
            />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className={inputCls}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <input
              {...register("password")}
              type="password"
              placeholder="Min. 8 characters"
              className={inputCls}
            />
          </FormField>

          <FormField
            label="Confirm Password"
            error={errors.confirmPassword?.message}
          >
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              className={inputCls}
            />
          </FormField>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a…
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "customer", label: "🍽️ Customer" },
                { value: "owner", label: "🍳 Restaurant Owner" },
              ].map(({ value, label }) => (
                <label key={value} className="cursor-pointer">
                  <input
                    {...register("role")}
                    type="radio"
                    value={value}
                    className="peer sr-only"
                  />
                  <div className="px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-medium text-sm text-gray-600 peer-checked:border-orange-500 peer-checked:text-orange-600 peer-checked:bg-orange-50 transition-colors">
                    {label}
                  </div>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-500 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
