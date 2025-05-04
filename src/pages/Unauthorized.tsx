
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-yellow-100 text-yellow-800 text-5xl font-bold w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          403
        </div>
        <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex space-x-4 justify-center">
          <Button asChild>
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
