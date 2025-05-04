
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
      <Toaster position="top-right" closeButton />
    </div>
  );
};

export default AuthLayout;
