import { isAuthenticated } from "@/lib/cart/cartService";
import Link from "next/link";
import { useEffect, useState } from "react";

const SignInLink = ({ className = "mt-[30px]" }) => {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const result = await Promise.resolve(isAuthenticated());
        if (!cancelled && result) setIsAuth(true);
      } catch (e) {
        // ignore errors; keep user unauthenticated
      }
    };
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {!isAuth && (
        <div className={`text-center ${className}`}>
          <p className="text-[14px] md:text-[16px] leading-[140%] font-medium ">
            Already have an account?{" "}
            <a href="/login-register" className="text-[#AE7E56]">
              Sign in
            </a>
          </p>
        </div>
      )}
    </>
  );
};

export default SignInLink;
