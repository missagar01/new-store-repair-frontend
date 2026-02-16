// Store Login UI - Same as StoreFMS
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ClipLoader as Loader } from "react-spinners";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Eye, EyeClosed, User, Lock } from "lucide-react";
import Logo from "../element/Logo";
import { toast } from "sonner";
import { decodeToken } from "../../config/api";

const STORE_OUT_ONLY = ["S07632", "S08088"];
const APPROVE_INDENT_ONLY = "S00116";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = decodeToken(token) as
          | { role?: string; employee_id?: string }
          | null;

        if (decoded?.employee_id) {
          const emp = decoded.employee_id;
          if (STORE_OUT_ONLY.includes(emp)) {
            navigate("/store/store-out-approval", { replace: true });
            return;
          }
          if (emp === APPROVE_INDENT_ONLY) {
            navigate("/store/approve-indent-data", { replace: true });
            return;
          }
        }

        if (decoded?.role === "admin") {
          navigate("/store/dashboard", { replace: true });
        } else {
          // Default landing for regular users
          const isMobile = window.innerWidth < 1024; // Match lg breakpoint
          if (isMobile) {
            navigate("/store/erp-indent", { replace: true });
          } else {
            navigate("/store/user-requisition", { replace: true });
          }
        }
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const schema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      form.setError("root", { message: "" }); // Clear previous errors

      // Check if username is employee ID (format: S followed by numbers)
      const isEmployeeId = /^S\d+$/i.test(values.username.trim());

      const loginData = {
        user_name: isEmployeeId ? undefined : values.username.trim(),
        employee_id: isEmployeeId ? values.username.trim() : undefined,
        password: values.password,
      };

      const success = await login(loginData);

      if (success) {
        toast.success("Login successful!");

        // Role-based redirect (StoreFMS logic)
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = decodeToken(token) as { role?: string; employee_id?: string } | null;

          if (decoded?.employee_id) {
            const emp = decoded.employee_id;
            // Store Out Only employees
            if (emp === "S07632" || emp === "S08088") {
              setTimeout(() => {
                navigate("/store/store-out-approval", { replace: true });
              }, 200);
              return;
            }
            // Approve Indent Only employee
            if (emp === "S00116") {
              setTimeout(() => {
                navigate("/store/approve-indent-data", { replace: true });
              }, 200);
              return;
            }
          }

          // Admin or regular user
          if (decoded?.role === "admin") {
            setTimeout(() => {
              navigate("/store/dashboard", { replace: true });
            }, 200);
          } else {
            // Default landing for regular users
            setTimeout(() => {
              const isMobile = window.innerWidth < 1024; // Match lg breakpoint
              if (isMobile) {
                navigate("/store/erp-indent", { replace: true });
              } else {
                navigate("/store/user-requisition", { replace: true });
              }
            }, 200);
          }
        } else {
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 200);
        }
      } else {
        throw new Error("Login failed - no success response");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid Username or Password";
      toast.error(errorMessage);
      form.setError("root", {
        message: errorMessage,
      });
    }
  }

  function onError() {
    // Error handler - no logging needed
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-blue-200 shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="grid gap-6">
              <CardHeader className="text-center flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-2 bg-blue-400 rounded-full blur-md opacity-20"></div>
                  <div className="relative bg-blue-500 rounded-full p-5 text-white shadow-lg flex items-center justify-center">
                    <Logo size={32} />
                  </div>
                </div>
                <CardTitle className="font-bold text-3xl text-gray-900">Repair & Store</CardTitle>
                <CardDescription className="text-blue-500 text-sm">
                  Sign in to your account
                </CardDescription>
              </CardHeader>

              <CardContent className="grid gap-4">
                {form.formState.errors.root && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username / Employee ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                            <User className="w-5 h-5" />
                          </span>
                          <Input
                            {...field}
                            className="pl-10"
                            placeholder="Enter username or S08362"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                            <Lock className="w-5 h-5" />
                          </span>
                          <Input
                            type={visible ? "text" : "password"}
                            className="pl-10 pr-10"
                            placeholder="Enter password"
                            {...field}
                          />
                          <Button
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-transparent active:bg-transparent"
                            tabIndex={-1}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setVisible((v) => !v);
                            }}
                          >
                            {visible ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader
                      size={20}
                      color="white"
                      aria-label="Loading Spinner"
                      className="mr-2"
                    />
                  )}
                  Sign In
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <footer className="bg-white border-t border-gray-200 py-3 px-4">
        <div className="text-center text-sm text-gray-600">
          Powered by{" "}
          <a
            href="https://www.botivate.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Botivate
          </a>
        </div>
      </footer>
    </div>
  );
}

