import Lottie from "lottie-react";
import dotLoader from "./dot-loader.json";
import poolsLoader from "./pools-loader.json";

export const LottieSmall = () => (
  <Lottie animationData={dotLoader} loop={true} autoplay={true} style={{ height: 20, width: 20 }} />
);

export const LottieMedium = () => (
  <Lottie animationData={dotLoader} loop={true} autoplay={true} style={{ height: 30, width: 30 }} />
);

export const LottieLarge = () => (
  <Lottie animationData={poolsLoader} loop={true} autoplay={true} style={{ height: 90, width: 90 }} />
);
