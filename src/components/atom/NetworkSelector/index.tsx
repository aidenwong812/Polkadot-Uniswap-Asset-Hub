import { Key, ReactNode, useRef } from "react";
import { NetworkKeys } from "../../../app/types/enum";
import RococoIcon from "../../../assets/img/rococo-icon.svg?react";
import WestendIcon from "../../../assets/img/westend-icon.svg?react";
import KusamaIcon from "../../../assets/img/kusama-icon.svg?react";
import PolkadotIcon from "../../../assets/img/dot-token.svg?react";
import SelectedNetworkCheck from "../../../assets/img/selected-token-check.svg?react";
import DownArrow from "../../../assets/img/down-arrow.svg?react";
import useClickOutside from "../../../app/hooks/useClickOutside";
import { useSearchParams } from "react-router-dom";

type Item = {
  name: string;
};

type SelectNetworkProps = {
  networkSelected?: NetworkKeys;
  type?: HTMLButtonElement["type"];
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  items: Item[];
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isDropdownOpen: boolean) => void;
};

const NetworkSelector = ({ networkSelected, items, isDropdownOpen, setIsDropdownOpen }: SelectNetworkProps) => {
  const wrapperRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const switchNetwork = (network: string) => {
    const networkParam = searchParams.get("network");
    if (networkParam) {
      searchParams.delete("network");
      setSearchParams(searchParams);
    }
    window.localStorage.setItem("network", network);
    window.location.reload();
  };

  useClickOutside(wrapperRef, () => {
    setIsDropdownOpen(false);
  });

  return (
    <div ref={wrapperRef} className="relative z-[10] flex align-middle">
      <button
        className="flex items-center gap-9 rounded-lg bg-purple-200 px-4 py-3"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        type="button"
      >
        <span className="flex items-center gap-2">
          {networkSelected === NetworkKeys.Kusama && <KusamaIcon width={20} height={20} />}
          {networkSelected === NetworkKeys.Rococo && <RococoIcon width={20} height={20} />}
          {networkSelected === NetworkKeys.Westend && <WestendIcon width={20} height={20} />}
          {networkSelected === NetworkKeys.Polkadot && <PolkadotIcon width={20} height={20} />}
          {networkSelected}
        </span>
        <DownArrow />
      </button>
      {isDropdownOpen && (
        <div className="radius absolute top-12 z-[100] flex flex-col rounded-lg bg-purple-50 p-4">
          {items?.map((item: Item, index: Key) => (
            <span key={index}>
              <button
                className="flex items-center gap-24 px-2 py-1"
                onClick={() => switchNetwork(item.name.toLowerCase())}
              >
                <span className="flex items-center gap-1">
                  {item.name.toLowerCase() === NetworkKeys.Kusama && <KusamaIcon width={20} height={20} />}
                  {item.name.toLowerCase() === NetworkKeys.Rococo && <RococoIcon width={20} height={20} />}
                  {item.name.toLowerCase() === NetworkKeys.Westend && <WestendIcon width={20} height={20} />}
                  {item.name.toLowerCase() === NetworkKeys.Polkadot && <PolkadotIcon width={20} height={20} />}
                  {item.name}
                </span>
                {networkSelected === item.name.toLowerCase() && <SelectedNetworkCheck />}
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
