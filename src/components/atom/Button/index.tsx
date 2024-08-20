import { ReactNode, useState } from "react";
import ArrowDownIcon from "../../../assets/img/down-arrow.svg?react";
import { ButtonVariants } from "../../../app/types/enum";
import "./style.scss";
import classNames from "classnames";

type ButtonProps = {
  children?: ReactNode;
  type?: HTMLButtonElement["type"];
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  variant?:
    | ButtonVariants.btnPrimaryPinkLg
    | ButtonVariants.btnPrimaryPinkSm
    | ButtonVariants.btnPrimaryGhostLg
    | ButtonVariants.btnPrimaryGhostSm
    | ButtonVariants.btnSecondaryWhite
    | ButtonVariants.btnSecondaryGray
    | ButtonVariants.btnInteractivePink
    | ButtonVariants.btnInteractiveGhost
    | ButtonVariants.btnInteractiveDisabled
    | ButtonVariants.btnSelectPink
    | ButtonVariants.btnSelectGray
    | ButtonVariants.btnSelectDisabled;
  onClick: () => void;
};

const Button = ({ children, disabled, className, icon, variant, onClick }: ButtonProps) => {
  const [isButtonHover, setIsButtonHover] = useState(false);

  const showArrowDownIcon = () => {
    if (variant === ButtonVariants.btnSelectPink && !disabled) {
      return <ArrowDownIcon width={16} height={16} color="white" />;
    }

    if (variant === ButtonVariants.btnSelectGray && !disabled) {
      return <ArrowDownIcon width={16} height={16} color={`${isButtonHover && !disabled ? "white" : "black"}`} />;
    }

    return null;
  };

  return (
    <button
      className={classNames(`btn ${className || ""}`, {
        "btn-primary-pink-lg": variant === undefined || variant === ButtonVariants.btnPrimaryPinkLg,
        "btn-primary-pink-sm": variant === ButtonVariants.btnPrimaryPinkSm,
        "btn-primary-ghost-lg": variant === ButtonVariants.btnPrimaryGhostLg,
        "btn-primary-ghost-sm": variant === ButtonVariants.btnPrimaryGhostSm,
        "btn-secondary-white": variant === ButtonVariants.btnSecondaryWhite,
        "btn-secondary-gray": variant === ButtonVariants.btnSecondaryGray,
        "btn-interactive-pink": variant === ButtonVariants.btnInteractivePink && !disabled,
        "btn-interactive-ghost": variant === ButtonVariants.btnInteractiveGhost && !disabled,
        "btn-interactive-disabled":
          (variant === ButtonVariants.btnInteractivePink && disabled) ||
          (variant === ButtonVariants.btnInteractiveGhost && disabled),
        "btn-select-pink": variant === ButtonVariants.btnSelectPink,
        "btn-select-gray": variant === ButtonVariants.btnSelectGray,
        "btn-select-disabled":
          (variant === ButtonVariants.btnSelectPink && disabled) ||
          (variant === ButtonVariants.btnSelectGray && disabled),
      })}
      onClick={() => (!disabled ? onClick() : null)}
      disabled={disabled}
      onMouseEnter={() => setIsButtonHover(true)}
      onMouseLeave={() => setIsButtonHover(false)}
      type="button"
    >
      {icon ? icon : null}
      {children}
      {showArrowDownIcon()}
    </button>
  );
};

export default Button;
