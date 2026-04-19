"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { ChevronRight, Loader2, MapPin } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  mobile: z.string().min(10, "Please enter a valid mobile number"),
  city: z.string().min(2, "City is required"),
  role: z.enum(["Marketer", "Developer", "Student", "Other"] as const, {
    message: "Please select a role",
  }),
  is_first_time: z.boolean(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      is_first_time: true,
    },
  });

  const isFirstTime = watch("is_first_time");

  const detectCity = () => {
    toast.promise(
      new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const res = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                );
                const data = await res.json();
                setValue("city", data.city || data.locality, { shouldValidate: true });
                resolve("City detected");
              } catch {
                reject("Could not fetch city");
              }
            },
            () => reject("Geolocation permission denied")
          );
        } else {
          reject("Geolocation not supported");
        }
      }),
      {
        loading: "Detecting city...",
        success: "City detected!",
        error: "Could not auto-detect city.",
      }
    );
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // Note: If no backend credentials yet, we simulate or handle errors gracefully
      const { error } = await supabase
        .from("attendees")
        .insert([
          {
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            city: data.city,
            role: data.role,
            first_time: data.is_first_time,
            linkedin_url: data.linkedinUrl || null,
          },
        ])
        .select()
        .single();

      if (error) {
        // Log the error but proceed with mock local data if supabase isn't configged
        console.error("Supabase Error:", error);
        toast.error("Error saving data. " + error.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Successfully Checked In!");
      router.push(`/success`);
    } catch {
      toast.error("Check-in failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Neon Glow on card edge */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00a1e0] to-transparent opacity-50"></div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white mb-2 neon-text-white">
              Smart Check-In
            </h2>
            <p className="text-gray-400 text-sm">
              Step 1 of 2: Let&apos;s get you registered for the event.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  {...register("name")}
                  autoFocus
                  className="w-full px-4 py-3 glass-input"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-4 py-3 glass-input"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Mobile
                  </label>
                  <input
                    {...register("mobile")}
                    type="tel"
                    className="w-full px-4 py-3 glass-input"
                    placeholder="+91 9876543210"
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>
                  )}
                </div>
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  LinkedIn Profile (Optional)
                </label>
                <input
                  {...register("linkedinUrl")}
                  type="url"
                  className="w-full px-4 py-3 glass-input"
                  placeholder="https://linkedin.com/in/johndoe"
                />
                {errors.linkedinUrl && (
                  <p className="mt-1 text-xs text-red-500">{errors.linkedinUrl.message}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  City
                </label>
                <div className="relative">
                  <input
                    {...register("city")}
                    className="w-full px-4 py-3 glass-input pr-12"
                    placeholder="Mumbai"
                  />
                  <button
                    type="button"
                    onClick={detectCity}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#00a1e0] transition-colors"
                    title="Auto-detect city"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Your Role
                </label>
                <select
                  {...register("role")}
                  className="w-full px-4 py-3 glass-input appearance-none bg-black/50"
                >
                  <option value="" disabled hidden>
                    Select Role
                  </option>
                  <option value="Marketer">Marketer</option>
                  <option value="Developer">Developer / Admin</option>
                  <option value="Student">Student / Fresher</option>
                  <option value="Other">Other</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>

              {/* First time toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-gray-300">
                  First time attending SFMC?
                </span>
                <button
                  type="button"
                  onClick={() => setValue("is_first_time", !isFirstTime)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isFirstTime ? "bg-[#00a1e0]" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isFirstTime ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[#00a1e0] hover:bg-[#008bc2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a1e0] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue Check-In
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
