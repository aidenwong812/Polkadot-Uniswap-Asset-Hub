import { useLocation } from "react-router-dom";
import { LiquidityPageType } from "../../app/types/enum";
import AddPoolLiquidity from "../../components/organism/AddPoolLiquidity";
import WithdrawPoolLiquidity from "../../components/organism/WithdrawPoolLiquidity";
import CreatePool from "../../components/organism/CreatePool";

const LiquidityPage = () => {
  const location = useLocation();

  const renderPoolComponent = () => {
    if (location.state?.pageType === LiquidityPageType.addLiquidity) {
      return <AddPoolLiquidity />;
    } else if (location.state?.pageType === LiquidityPageType.removeLiquidity) {
      return <WithdrawPoolLiquidity />;
    } else {
      return <CreatePool />;
    }
  };

  return <div className="flex items-center justify-center pt-24">{renderPoolComponent()}</div>;
};

export default LiquidityPage;
