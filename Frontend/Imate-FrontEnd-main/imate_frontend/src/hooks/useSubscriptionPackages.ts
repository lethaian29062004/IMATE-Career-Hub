import { useQuery } from "@tanstack/react-query";
import { getSubscriptionPackages } from "@/services/subscriptionPackageService";

export const useSubscriptionPackages = () => {
  return useQuery({
    queryKey: ["subscription-packages"],
    queryFn: getSubscriptionPackages,
  });
};
