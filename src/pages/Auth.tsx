
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Mail, AlertCircle, Loader2, Github, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Provider } from "@supabase/supabase-js";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<Provider | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [resendingEmail, setResendingEmail] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, signInWithProvider, resendVerificationEmail, isVerified } = useAuth();
  
  const from = location.state?.from?.pathname || "/";
  
  useEffect(() => {
    if (user && isVerified) {
      navigate(from, { replace: true });
    }
  }, [user, isVerified, navigate, from]);
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error, data } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please log in instead.");
        } else {
          toast.error(error.message);
        }
      } else {
        setIsSignUp(true);
        toast.success("Check your email for the confirmation link!");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setIsSignUp(true);
          toast.error("Please verify your email before signing in");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Login successful!");
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: Provider) => {
    setProviderLoading(provider);
    try {
      await signInWithProvider(provider);
      // No need to handle navigation here as it will redirect to the provider's auth page
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      toast.error(`Failed to sign in with ${provider}`);
      setProviderLoading(null);
    }
  };

  const handleResendVerificationEmail = async () => {
    setResendingEmail(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.error) {
        toast.error(result.error.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("Failed to resend verification email");
    } finally {
      setResendingEmail(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsSignUp(false);
  };
  
  const handleBackClick = () => {
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };
  
  if (loading && !isSignUp) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }
  
  if (isSignUp) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container max-w-md mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Verify Your Email
              </CardTitle>
              <CardDescription>
                We've sent a verification link to your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
                <AlertCircle className="text-blue-500 mr-2 h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700">
                    Please check <strong>{email}</strong> for a verification link. You need to verify your email before you can sign in.
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                If you don't see the email, check your spam folder or request a new verification email.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full"
                onClick={handleResendVerificationEmail}
                disabled={resendingEmail}
              >
                {resendingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsSignUp(false)}
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container max-w-md mx-auto py-10">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={handleBackClick}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : "Login"}
                  </Button>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => handleProviderSignIn('google')}
                    disabled={providerLoading !== null}
                  >
                    {providerLoading === 'google' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="mr-2 h-4 w-4" />
                    )}
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => handleProviderSignIn('github')}
                    disabled={providerLoading !== null}
                  >
                    {providerLoading === 'github' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    GitHub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>
                  Sign up with your email to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : "Create Account"}
                  </Button>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => handleProviderSignIn('google')}
                    disabled={providerLoading !== null}
                  >
                    {providerLoading === 'google' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="mr-2 h-4 w-4" />
                    )}
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => handleProviderSignIn('github')}
                    disabled={providerLoading !== null}
                  >
                    {providerLoading === 'github' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    GitHub
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
