import { NETWORKS } from "../../networkConfig";
import { NetworkKeys } from "../types/enum";

const useGetNetwork = () => {
  const network = window.localStorage.getItem("network");

  if (network) {
    return NETWORKS[network as NetworkKeys];
  } else {
    window.localStorage.setItem("network", NetworkKeys.Kusama);
    return NETWORKS[NetworkKeys.Kusama];
  }
};

export default useGetNetwork;
